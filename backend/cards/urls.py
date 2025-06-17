from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CardReviewViewSet,
    CardViewSet,
    DeckViewSet,
    LearningSessionViewSet,
    UserViewSet,
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
]