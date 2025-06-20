from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Card, Deck, LearningSession, User


class ModelTests(TestCase):
    """
    Test the models
    """
    def setUp(self):
        """
        Set up the test environment
        """
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.deck = Deck.objects.create(
            owner=self.user,
            title='Test Deck',
            description='Test Description'
        )
        self.card = Card.objects.create(
            deck=self.deck,
            front='Test Front',
            back='Test Back'
        )

    def test_deck_creation(self):
        """
        Test Deck-Creation and Relationships
        """
        self.assertEqual(self.deck.title, 'Test Deck')
        self.assertEqual(self.deck.owner, self.user)
        self.assertEqual(self.deck.card_count, 1)

    def test_card_creation(self):
        """
        Test Card-Creation and Relationships
        """
        self.assertEqual(self.card.front, 'Test Front')
        self.assertEqual(self.card.back, 'Test Back')
        self.assertEqual(self.card.deck, self.deck)

    def test_learning_session(self):
        """
        Test Learning Session-Creation and Status
        """
        session = LearningSession.objects.create(
            user=self.user,
            deck=self.deck
        )
        self.assertEqual(session.status, 'active')
        self.assertEqual(session.user, self.user)
        self.assertEqual(session.deck, self.deck)
        self.assertIsNone(session.ended_at)

    def test_user_statistics(self):
        """
        Test User Statistics Properties
        """
        self.assertEqual(self.user.total_cards_created, 1)
        self.assertEqual(self.user.total_decks_created, 1)


class APITests(APITestCase):
    """
    Test the API
    """
    def setUp(self):
        """
        Set up the test environment
        """
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.deck = Deck.objects.create(
            owner=self.user,
            title='Test Deck',
            description='Test Description'
        )
        self.card = Card.objects.create(
            deck=self.deck,
            front='Test Front',
            back='Test Back'
        )

    def test_deck_list(self):
        """
        Test Deck-List API
        """
        url = reverse('deck-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Test Deck')

    def test_deck_create(self):
        """
        Test Deck-Creation API
        """
        url = reverse('deck-list')
        data = {
            'title': 'New Deck',
            'description': 'New Description',
            'is_public': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Deck.objects.count(), 2)
        self.assertEqual(Deck.objects.get(title='New Deck').owner, self.user)

    def test_card_create(self):
        """
        Test Card-Creation API
        """
        url = reverse('card-list')
        data = {
            'deck': self.deck.id,
            'front': 'New Front',
            'back': 'New Back'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Card.objects.count(), 2)

    def test_learning_session_flow(self):
        """
        Test complete Learning Session Flow
        """
        url = reverse('learningsession-list')
        data = {'deck_id': self.deck.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        session_id = response.data['id']

        review_url = reverse('cardreview-list')
        review_data = {
            'session_id': session_id,
            'card_id': self.card.id,
            'is_correct': True,
            'time_taken': 5000
        }
        response = self.client.post(review_url, review_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        complete_url = reverse('learningsession-complete', args=[session_id])
        response = self.client.post(complete_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            LearningSession.objects.get(id=session_id).status,
            'completed'
        )

    def test_unauthorized_access(self):
        """
        Test unauthorized access
        """
        self.client.force_authenticate(user=None)
        url = reverse('deck-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_other_user_deck_access(self):
        """
        Test access to other user's decks
        """
        other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        other_deck = Deck.objects.create(
            owner=other_user,
            title='Other Deck',
            description='Other Description',
            is_public=False
        )
        
        url = reverse('deck-detail', args=[other_deck.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        data = {'title': 'Hacked Deck'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        other_deck.is_public = True
        other_deck.save()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
