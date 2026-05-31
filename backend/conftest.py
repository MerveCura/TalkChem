import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from unittest.mock import MagicMock

# OpenAI client'ı mock'luyorum — test ortamında gerçek API key olmadığı için
# router dosyaları import edilirken OpenAI() çağrısı hata fırlatır
# Bu mock sayesinde tüm OpenAI çağrıları sahte nesne döndürür
# Uygulamanın kendisini etkilemez, sadece pytest çalışırken devreye girer
import openai
openai.OpenAI = MagicMock(return_value=MagicMock())