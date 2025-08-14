
import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import posthog from 'posthog-js';

export default function FeedbackForm({ user, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submitFeedback = async () => {
    if (!user) return alert("You must be logged in");

    await addDoc(collection(db, 'feedback'), {
      userId: user.uid,
      rating,
      comment,
      createdAt: serverTimestamp()
    });

    posthog.capture('feedback_submitted', { rating, comment });

    alert('Thanks for your feedback!');
    onClose?.();
  };

  return (
    <div style={{ padding: 20, background: '#fff' }}>
      <h3>Rate your experience</h3>
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      />
      <textarea
        placeholder="Leave a comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button onClick={submitFeedback}>Submit</button>
    </div>
  );
}
