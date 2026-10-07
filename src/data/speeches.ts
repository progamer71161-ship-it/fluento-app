export interface MeaningfulSpeech {
  id: string;
  title: string;
  author: string;
  category: 'Inspiration' | 'Philosophy' | 'Leadership' | 'Wonder' | 'Resilience';
  theme: string;
  text: string;
  wordCount: number;
  estimatedSeconds: number; // at ~140 WPM
  keyPacingNote: string;
}

export const MEANINGFUL_SPEECHES: MeaningfulSpeech[] = [
  {
    id: 'pale_blue_dot',
    title: 'The Pale Blue Dot',
    author: 'Carl Sagan',
    category: 'Wonder',
    theme: 'Perspective & Humility',
    text: "Look again at that dot. That's here. That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives. The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic doctrines. Every hunter and forager, every hero and coward, every creator and destroyer of civilization lived there—on a mote of dust suspended in a sunbeam. There is perhaps no better demonstration of the folly of human conceits than this distant image of our tiny world.",
    wordCount: 97,
    estimatedSeconds: 42,
    keyPacingNote: 'Take a deliberate 1.5s pause after "That\'s us" to allow the sense of cosmic scale to resonate.'
  },
  {
    id: 'man_in_the_arena',
    title: 'The Man in the Arena',
    author: 'Theodore Roosevelt',
    category: 'Leadership',
    theme: 'Courage Under Fire',
    text: "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood; who strives valiantly; who errs, who comes short again and again, because there is no effort without error and shortcoming; but who does actually strive to do the deeds; who spends himself in a worthy cause; who at the best knows in the end the triumph of high achievement, and who at the worst, if he fails, at least fails while daring greatly.",
    wordCount: 114,
    estimatedSeconds: 49,
    keyPacingNote: 'Use a firm, grounded cadence with downward vocal pitch at "daring greatly".'
  },
  {
    id: 'connect_the_dots',
    title: 'Connecting the Dots',
    author: 'Steve Jobs',
    category: 'Inspiration',
    theme: 'Trusting Your Intuition',
    text: "You can't connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future. You have to trust in something—your gut, destiny, life, karma, whatever. Because believing that the dots will connect down the road will give you the confidence to follow your heart, even when it leads you off the well-worn path. And that will make all the difference. Your time is limited, so don't waste it living someone else's life.",
    wordCount: 92,
    estimatedSeconds: 39,
    keyPacingNote: 'Keep an intimate, conversational pace. Pause for breath before "And that will make all the difference".'
  },
  {
    id: 'courage_and_virtue',
    title: 'The Foundation of Courage',
    author: 'Maya Angelou',
    category: 'Resilience',
    theme: 'Moral Strength',
    text: "Courage is the most important of all the virtues because without courage, you cannot practice any other virtue consistently. You can practice any virtue erratically, but nothing consistently without courage. It is very important to develop courage by doing small, courageous things. You develop courage the same way you build muscular strength—you begin by picking up a light weight, and gradually, through practice and grace, you learn to stand firm against the strongest winds.",
    wordCount: 78,
    estimatedSeconds: 34,
    keyPacingNote: 'Emphasize the word "consistently" with gentle articulatory clarity rather than volume.'
  },
  {
    id: 'vulnerability_and_daring',
    title: 'The Arena of Vulnerability',
    author: 'Brené Brown',
    category: 'Leadership',
    theme: 'Authentic Connection',
    text: "Vulnerability is not winning or losing; it's having the courage to show up and be seen when we have no control over the outcome. Vulnerability is not weakness; it's our greatest measure of courage. When we spend our lives waiting until we are bulletproof or perfect before we enter the arena, we sacrifice relationships and opportunities that may not come back. To love someone fiercely, to believe in something with your whole heart, to celebrate moments of joy—all of that requires us to dare greatly.",
    wordCount: 88,
    estimatedSeconds: 38,
    keyPacingNote: 'Maintain soft, steady camera eye contact to project psychological safety and openness.'
  },
  {
    id: 'poetry_and_humanity',
    title: 'Why We Strive',
    author: 'Robin Williams (as John Keating)',
    category: 'Inspiration',
    theme: 'Passion & Purpose',
    text: "We don't read and write poetry because it's cute. We read and write poetry because we are members of the human race. And the human race is filled with passion. Medicine, law, business, engineering—these are noble pursuits and necessary to sustain life. But poetry, beauty, romance, love—these are what we stay alive for. To quote from Whitman: 'O me! O life! of the questions of these recurring... That you are here—that life exists and identity, that the powerful play goes on, and you may contribute a verse.' What will your verse be?",
    wordCount: 97,
    estimatedSeconds: 42,
    keyPacingNote: 'Drop your pitch and pause for two full seconds before delivering the final question: "What will your verse be?"'
  },
  {
    id: 'mind_and_citadel',
    title: 'The Inner Citadel',
    author: 'Marcus Aurelius',
    category: 'Philosophy',
    theme: 'Mental Equilibrium',
    text: "You have power over your mind—not outside events. Realize this, and you will find immense strength. Dwell on the beauty of life. Watch the stars, and see yourself running with them. When you arise in the morning think of what a privilege it is to be alive, to think, to enjoy, to love. The happiness of your life depends upon the quality of your thoughts. Waste no more time arguing about what a good person should be. Be one.",
    wordCount: 80,
    estimatedSeconds: 35,
    keyPacingNote: 'Maintain a slow, meditative tempo (115–125 WPM) with grounded, level shoulder posture.'
  },
  {
    id: 'pleasure_of_finding_out',
    title: 'The Pleasure of Doubt',
    author: 'Richard Feynman',
    category: 'Wonder',
    theme: 'Curiosity & Humility',
    text: "I can live with doubt, and uncertainty, and not knowing. I think it's much more interesting to live not knowing than to have answers which might be wrong. I have approximate answers and possible beliefs and different degrees of certainty about different things, but I'm not absolutely sure of anything. I don't feel frightened by not knowing things, by being lost in a mysterious universe without any purpose. It doesn't frighten me.",
    wordCount: 75,
    estimatedSeconds: 32,
    keyPacingNote: 'Use an upbeat, exploratory inflection. Smile gently as you speak to convey intellectual delight.'
  },
  {
    id: 'gratitude_for_consciousness',
    title: 'Gratitude for Being',
    author: 'Oliver Sacks',
    category: 'Philosophy',
    theme: 'Preciousness of Consciousness',
    text: "Above all, I have been a sentient being, a thinking animal, on this beautiful planet, and that in itself has been an enormous privilege and adventure. There will be no one like us when we are gone, but then there is no one like anyone else, ever. When people die, they cannot be replaced. They leave a hole that cannot be filled, for it is the fate—the genetic and neural fate—of every human being to be a unique individual, to find his own path, to create his own life.",
    wordCount: 90,
    estimatedSeconds: 39,
    keyPacingNote: 'Breathe deeply between thoughts. Let each statement settle before beginning the next.'
  },
  {
    id: 'making_a_difference',
    title: 'Every Individual Matters',
    author: 'Jane Goodall',
    category: 'Leadership',
    theme: 'Individual Agency',
    text: "You cannot get through a single day without having an impact on the world around you. What you do makes a difference, and you have to decide what kind of difference you want to make. It is so easy to feel overwhelmed, to feel helpless in the face of immense global challenges. But remember: hope is not passive. Hope is about having the tenacity to roll up your sleeves and take action. Every choice counts, every voice matters.",
    wordCount: 81,
    estimatedSeconds: 35,
    keyPacingNote: 'Stress the contrast words: "passive" versus "action", maintaining a firm, warm timbre.'
  }
];

export const getRandomSpeech = (currentId?: string): MeaningfulSpeech => {
  const filtered = MEANINGFUL_SPEECHES.filter((s) => s.id !== currentId);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || MEANINGFUL_SPEECHES[0];
};
