import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from unittest.mock import MagicMock
import openai

# OpenAI client'larını mock'luyorum — test ortamında gerçek API key olmadığı için
# router ve pregenerate dosyaları import edilirken OpenAI() çağrısı hata fırlatır
# Bu mock sayesinde tüm OpenAI çağrıları sahte nesne döndürür
# Uygulamanın kendisini etkilemez, sadece pytest çalışırken devreye girer
openai.OpenAI = MagicMock(return_value=MagicMock())
openai.AsyncOpenAI = MagicMock(return_value=MagicMock())