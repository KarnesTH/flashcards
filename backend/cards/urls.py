from rest_framework.routers import DefaultRouter
from .views import (
    DeckViewSet, CardViewSet, TagViewSet, LearningSessionViewSet, CardReviewViewSet, BadgeViewSet, UserBadgeViewSet
)

router = DefaultRouter()
router.register(r'decks', DeckViewSet, basename='deck')
router.register(r'cards', CardViewSet, basename='card')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'learning-sessions', LearningSessionViewSet, basename='learningsession')
router.register(r'card-reviews', CardReviewViewSet, basename='cardreview')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'user-badges', UserBadgeViewSet, basename='userbadge')

urlpatterns = router.urls