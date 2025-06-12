from django.contrib.auth.models import User
from django.db import models


class Tag(models.Model):
    """
    Tag for a deck
    """
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Deck(models.Model):
    """
    Deck of cards
    """
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='decks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    tags = models.ManyToManyField(Tag, related_name='decks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Card(models.Model):
    """
    Card in a deck
    """
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='cards')
    front = models.TextField()
    back = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.front
    
class LearningSession(models.Model):
    """
    Learning session for a deck
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.deck.title}"
    
class CardReview(models.Model):
    """
    Review of a card in a learning session
    """
    session = models.ForeignKey(LearningSession, on_delete=models.CASCADE, related_name='reviews')
    card = models.ForeignKey(Card, on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)
    time_taken = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.session.user.username} - {self.card.front}"
    
class Badge(models.Model):
    """
    Badge for a user
    """
    name = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.ImageField(upload_to='badges/')
    condition = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class UserBadge(models.Model):
    """
    User badge for a user
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"