from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CardReviewViewSet,
    CardViewSet,
    DeckViewSet,
    LearningSessionViewSet,
    LearningStatsView,
    UserViewSet,
    AIGenerateView,
    AIAnswerCheckView,
    AIHealthCheckView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'decks', DeckViewSet, basename='deck')
router.register(r'cards', CardViewSet, basename='card')
router.register(
    r'learning-sessions', 
    LearningSessionViewSet, 
    basename='learningsession'
)
router.register(r'card-reviews', CardReviewViewSet, basename='cardreview')

urlpatterns = [
    path('', include(router.urls)),
    path('learning-stats/', LearningStatsView.as_view(), name='learning-stats'),
    path('ai/generate/', AIGenerateView.as_view(), name='ai-generate'),
    path('ai/check-answer/', AIAnswerCheckView.as_view(), name='ai-check-answer'),
    path('ai/health/', AIHealthCheckView.as_view(), name='ai-health'),
]