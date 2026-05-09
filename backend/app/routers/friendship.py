from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Friendship
from app.routers.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/friends", tags=["friends"])


def format_user(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "english_level": user.english_level,
        "profile_image": user.profile_image,
    }


@router.get("/search")
def search_users(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Kullanıcı adına göre ara — kendini gösterme
    users = db.query(User).filter(
        User.username.ilike(f"%{q}%"),
        User.id != current_user.id,
    ).limit(10).all()

    # Her kullanıcı için arkadaşlık durumunu ekle
    result = []
    for u in users:
        friendship = db.query(Friendship).filter(
            ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == u.id)) |
            ((Friendship.requester_id == u.id) & (Friendship.addressee_id == current_user.id))
        ).first()

        result.append({
            **format_user(u),
            "friendship_status": friendship.status if friendship else None,
            "friendship_id": friendship.id if friendship else None,
            "is_requester": friendship.requester_id == current_user.id if friendship else None,
        })
    return result


@router.post("/request/{user_id}")
def send_friend_request(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    # Zaten istek var mı?
    existing = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == user_id)) |
        ((Friendship.requester_id == user_id) & (Friendship.addressee_id == current_user.id))
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Friendship request already exists")

    friendship = Friendship(
        requester_id=current_user.id,
        addressee_id=user_id,
        status="pending",
    )
    db.add(friendship)
    db.commit()
    db.refresh(friendship)
    return {"message": "Friend request sent", "friendship_id": friendship.id}


@router.post("/accept/{friendship_id}")
def accept_friend_request(
    friendship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendship = db.query(Friendship).filter(
        Friendship.id == friendship_id,
        Friendship.addressee_id == current_user.id,
        Friendship.status == "pending",
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")

    friendship.status = "accepted"
    friendship.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Friend request accepted"}


@router.post("/reject/{friendship_id}")
def reject_friend_request(
    friendship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendship = db.query(Friendship).filter(
        Friendship.id == friendship_id,
        Friendship.addressee_id == current_user.id,
        Friendship.status == "pending",
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")

    friendship.status = "rejected"
    friendship.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Friend request rejected"}


@router.delete("/remove/{user_id}")
def remove_friend(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendship = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == user_id)) |
        ((Friendship.requester_id == user_id) & (Friendship.addressee_id == current_user.id)),
        Friendship.status == "accepted",
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")

    db.delete(friendship)
    db.commit()
    return {"message": "Friend removed"}


@router.get("/list")
def get_friends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendships = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) | (Friendship.addressee_id == current_user.id)),
        Friendship.status == "accepted",
    ).all()

    friends = []
    for f in friendships:
        friend = f.addressee if f.requester_id == current_user.id else f.requester
        friends.append({
            **format_user(friend),
            "friendship_id": f.id,
        })
    return friends


@router.get("/requests")
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Gelen bekleyen istekler
    incoming = db.query(Friendship).filter(
        Friendship.addressee_id == current_user.id,
        Friendship.status == "pending",
    ).all()

    return [
        {
            **format_user(f.requester),
            "friendship_id": f.id,
            "created_at": f.created_at.isoformat(),
        }
        for f in incoming
    ]