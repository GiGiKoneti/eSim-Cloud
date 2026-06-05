"""
chatbotAPI/urls.py

Registers:
  POST  /api/chat/message/   →  ChatMessageView
"""
from django.urls import path
from .views import ChatMessageView, ChatStatusView

urlpatterns = [
    path('message/', ChatMessageView.as_view(), name='chat-message'),
    path('status/', ChatStatusView.as_view(), name='chat-status'),
]
