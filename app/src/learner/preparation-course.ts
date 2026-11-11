import type { Course } from "../teacher/course.ts";

// Version-one learner preparation snapshot, generated once from the existing
// café readyTemplates()[0] sample intentionally adopted for this feature.
// Public title/language/A2 level/goal and module IDs/minutes match public-lessons.ts.
// This is not read from teacher drafts or regenerated at runtime. Change assigned
// material under a new preparation ID/version instead of changing this snapshot.
export const preparationCourse: Course = {
  "title": "A conversation at the café",
  "goal": "Order a drink and ask a natural follow-up question. Practice useful words, build your sentence and try it with your teacher.",
  "language": "French",
  "level": "A2",
  "modules": [
    {
      "id": "cafe-warm-up",
      "type": "Warm-up",
      "title": "Warm-up",
      "goal": "Build confidence with warm-up.",
      "minutes": 5,
      "blocks": [
        {
          "id": "cafe-warm-up-block-1",
          "format": "Vocabulary recall",
          "purpose": "Practice",
          "title": "Vocabulary recall",
          "instructions": "Take your time and try it yourself.",
          "text": "Je voudrais un café, s’il vous plaît.",
          "translation": "I would like a coffee, please.",
          "answer": "Je voudrais un café",
          "alternatives": "",
          "words": [
            {
              "id": "cafe-warm-up-block-1-word-1",
              "word": "un café",
              "meaning": "a coffee",
              "picture": "☕",
              "pronunciation": "un café"
            },
            {
              "id": "cafe-warm-up-block-1-word-2",
              "word": "un thé",
              "meaning": "a tea",
              "picture": "🍵",
              "pronunciation": "un thé"
            }
          ],
          "parts": [
            {
              "id": "cafe-warm-up-block-1-part-1",
              "text": "Je",
              "role": "Subject",
              "note": "I"
            },
            {
              "id": "cafe-warm-up-block-1-part-2",
              "text": "voudrais",
              "role": "Verb",
              "note": "would like · vouloir, conditional"
            },
            {
              "id": "cafe-warm-up-block-1-part-3",
              "text": "un café",
              "role": "Object",
              "note": "Swap for un thé"
            }
          ],
          "pairs": [
            {
              "id": "cafe-warm-up-block-1-pair-1",
              "left": "un café",
              "right": "a coffee"
            },
            {
              "id": "cafe-warm-up-block-1-pair-2",
              "left": "un thé",
              "right": "a tea"
            }
          ],
          "choices": [
            "A coffee",
            "A ticket",
            "A book"
          ],
          "clips": [
            {
              "id": "cafe-warm-up-block-1-clip-1",
              "title": "Ordering a coffee",
              "transcript": "Qu’est-ce que vous voulez ?",
              "answer": "Je voudrais un café, s’il vous plaît."
            }
          ],
          "picture": "☕"
        }
      ]
    },
    {
      "id": "cafe-vocabulary",
      "type": "Vocabulary",
      "title": "Vocabulary",
      "goal": "Build confidence with vocabulary.",
      "minutes": 5,
      "blocks": [
        {
          "id": "cafe-vocabulary-block-1",
          "format": "Flashcards",
          "purpose": "Teach",
          "title": "Flashcards",
          "instructions": "Explore the example, then make it your own.",
          "text": "Je voudrais un café, s’il vous plaît.",
          "translation": "I would like a coffee, please.",
          "answer": "Je voudrais un café",
          "alternatives": "",
          "words": [
            {
              "id": "cafe-vocabulary-block-1-word-1",
              "word": "un café",
              "meaning": "a coffee",
              "picture": "☕",
              "pronunciation": "un café"
            },
            {
              "id": "cafe-vocabulary-block-1-word-2",
              "word": "un thé",
              "meaning": "a tea",
              "picture": "🍵",
              "pronunciation": "un thé"
            }
          ],
          "parts": [
            {
              "id": "cafe-vocabulary-block-1-part-1",
              "text": "Je",
              "role": "Subject",
              "note": "I"
            },
            {
              "id": "cafe-vocabulary-block-1-part-2",
              "text": "voudrais",
              "role": "Verb",
              "note": "would like · vouloir, conditional"
            },
            {
              "id": "cafe-vocabulary-block-1-part-3",
              "text": "un café",
              "role": "Object",
              "note": "Swap for un thé"
            }
          ],
          "pairs": [
            {
              "id": "cafe-vocabulary-block-1-pair-1",
              "left": "un café",
              "right": "a coffee"
            },
            {
              "id": "cafe-vocabulary-block-1-pair-2",
              "left": "un thé",
              "right": "a tea"
            }
          ],
          "choices": [
            "A coffee",
            "A ticket",
            "A book"
          ],
          "clips": [
            {
              "id": "cafe-vocabulary-block-1-clip-1",
              "title": "Ordering a coffee",
              "transcript": "Qu’est-ce que vous voulez ?",
              "answer": "Je voudrais un café, s’il vous plaît."
            }
          ],
          "picture": "☕"
        },
        {
          "id": "cafe-vocabulary-block-2",
          "format": "Matching pairs",
          "purpose": "Practice",
          "title": "Matching pairs",
          "instructions": "Take your time and try it yourself.",
          "text": "Je voudrais un café, s’il vous plaît.",
          "translation": "I would like a coffee, please.",
          "answer": "Je voudrais un café",
          "alternatives": "",
          "words": [
            {
              "id": "cafe-vocabulary-block-2-word-1",
              "word": "un café",
              "meaning": "a coffee",
              "picture": "☕",
              "pronunciation": "un café"
            },
            {
              "id": "cafe-vocabulary-block-2-word-2",
              "word": "un thé",
              "meaning": "a tea",
              "picture": "🍵",
              "pronunciation": "un thé"
            }
          ],
          "parts": [
            {
              "id": "cafe-vocabulary-block-2-part-1",
              "text": "Je",
              "role": "Subject",
              "note": "I"
            },
            {
              "id": "cafe-vocabulary-block-2-part-2",
              "text": "voudrais",
              "role": "Verb",
              "note": "would like · vouloir, conditional"
            },
            {
              "id": "cafe-vocabulary-block-2-part-3",
              "text": "un café",
              "role": "Object",
              "note": "Swap for un thé"
            }
          ],
          "pairs": [
            {
              "id": "cafe-vocabulary-block-2-pair-1",
              "left": "un café",
              "right": "a coffee"
            },
            {
              "id": "cafe-vocabulary-block-2-pair-2",
              "left": "un thé",
              "right": "a tea"
            }
          ],
          "choices": [
            "A coffee",
            "A ticket",
            "A book"
          ],
          "clips": [
            {
              "id": "cafe-vocabulary-block-2-clip-1",
              "title": "Ordering a coffee",
              "transcript": "Qu’est-ce que vous voulez ?",
              "answer": "Je voudrais un café, s’il vous plaît."
            }
          ],
          "picture": "☕"
        }
      ]
    },
    {
      "id": "cafe-grammar",
      "type": "Grammar",
      "title": "Grammar",
      "goal": "Build confidence with grammar.",
      "minutes": 5,
      "blocks": [
        {
          "id": "cafe-grammar-block-1",
          "format": "Sentence construction",
          "purpose": "Teach",
          "title": "Sentence construction",
          "instructions": "Explore the example, then make it your own.",
          "text": "Je voudrais un café, s’il vous plaît.",
          "translation": "I would like a coffee, please.",
          "answer": "Je voudrais un café",
          "alternatives": "",
          "words": [
            {
              "id": "cafe-grammar-block-1-word-1",
              "word": "un café",
              "meaning": "a coffee",
              "picture": "☕",
              "pronunciation": "un café"
            },
            {
              "id": "cafe-grammar-block-1-word-2",
              "word": "un thé",
              "meaning": "a tea",
              "picture": "🍵",
              "pronunciation": "un thé"
            }
          ],
          "parts": [
            {
              "id": "cafe-grammar-block-1-part-1",
              "text": "Je",
              "role": "Subject",
              "note": "I"
            },
            {
              "id": "cafe-grammar-block-1-part-2",
              "text": "voudrais",
              "role": "Verb",
              "note": "would like · vouloir, conditional"
            },
            {
              "id": "cafe-grammar-block-1-part-3",
              "text": "un café",
              "role": "Object",
              "note": "Swap for un thé"
            }
          ],
          "pairs": [
            {
              "id": "cafe-grammar-block-1-pair-1",
              "left": "un café",
              "right": "a coffee"
            },
            {
              "id": "cafe-grammar-block-1-pair-2",
              "left": "un thé",
              "right": "a tea"
            }
          ],
          "choices": [
            "A coffee",
            "A ticket",
            "A book"
          ],
          "clips": [
            {
              "id": "cafe-grammar-block-1-clip-1",
              "title": "Ordering a coffee",
              "transcript": "Qu’est-ce que vous voulez ?",
              "answer": "Je voudrais un café, s’il vous plaît."
            }
          ],
          "picture": "☕"
        },
        {
          "id": "cafe-grammar-block-2",
          "format": "Sentence construction",
          "purpose": "Practice",
          "title": "Sentence construction",
          "instructions": "Take your time and try it yourself.",
          "text": "Je voudrais un café, s’il vous plaît.",
          "translation": "I would like a coffee, please.",
          "answer": "Je voudrais un café",
          "alternatives": "",
          "words": [
            {
              "id": "cafe-grammar-block-2-word-1",
              "word": "un café",
              "meaning": "a coffee",
              "picture": "☕",
              "pronunciation": "un café"
            },
            {
              "id": "cafe-grammar-block-2-word-2",
              "word": "un thé",
              "meaning": "a tea",
              "picture": "🍵",
              "pronunciation": "un thé"
            }
          ],
          "parts": [
            {
              "id": "cafe-grammar-block-2-part-1",
              "text": "Je",
              "role": "Subject",
              "note": "I"
            },
            {
              "id": "cafe-grammar-block-2-part-2",
              "text": "voudrais",
              "role": "Verb",
              "note": "would like · vouloir, conditional"
            },
            {
              "id": "cafe-grammar-block-2-part-3",
              "text": "un café",
              "role": "Object",
              "note": "Swap for un thé"
            }
          ],
          "pairs": [
            {
              "id": "cafe-grammar-block-2-pair-1",
              "left": "un café",
              "right": "a coffee"
            },
            {
              "id": "cafe-grammar-block-2-pair-2",
              "left": "un thé",
              "right": "a tea"
            }
          ],
          "choices": [
            "A coffee",
            "A ticket",
            "A book"
          ],
          "clips": [
            {
              "id": "cafe-grammar-block-2-clip-1",
              "title": "Ordering a coffee",
              "transcript": "Qu’est-ce que vous voulez ?",
              "answer": "Je voudrais un café, s’il vous plaît."
            }
          ],
          "picture": "☕"
        }
      ]
    },
    {
      "id": "cafe-listening",
      "type": "Listening",
      "title": "Listening",
      "goal": "Build confidence with listening.",
      "minutes": 5,
      "blocks": [
        {
          "id": "cafe-listening-block-1",
          "format": "Audio",
          "purpose": "Teach",
          "title": "Audio",
          "instructions": "Explore the example, then make it your own.",
          "text": "Je voudrais un café, s’il vous plaît.",
          "translation": "I would like a coffee, please.",
          "answer": "Je voudrais un café",
          "alternatives": "",
          "words": [
            {
              "id": "cafe-listening-block-1-word-1",
              "word": "un café",
              "meaning": "a coffee",
              "picture": "☕",
              "pronunciation": "un café"
            },
            {
              "id": "cafe-listening-block-1-word-2",
              "word": "un thé",
              "meaning": "a tea",
              "picture": "🍵",
              "pronunciation": "un thé"
            }
          ],
          "parts": [
            {
              "id": "cafe-listening-block-1-part-1",
              "text": "Je",
              "role": "Subject",
              "note": "I"
            },
            {
              "id": "cafe-listening-block-1-part-2",
              "text": "voudrais",
              "role": "Verb",
              "note": "would like · vouloir, conditional"
            },
            {
              "id": "cafe-listening-block-1-part-3",
              "text": "un café",
              "role": "Object",
              "note": "Swap for un thé"
            }
          ],
          "pairs": [
            {
              "id": "cafe-listening-block-1-pair-1",
              "left": "un café",
              "right": "a coffee"
            },
            {
              "id": "cafe-listening-block-1-pair-2",
              "left": "un thé",
              "right": "a tea"
            }
          ],
          "choices": [
            "A coffee",
            "A ticket",
            "A book"
          ],
          "clips": [
            {
              "id": "cafe-listening-block-1-clip-1",
              "title": "Ordering a coffee",
              "transcript": "Qu’est-ce que vous voulez ?",
              "answer": "Je voudrais un café, s’il vous plaît."
            }
          ],
          "picture": "☕"
        },
        {
          "id": "cafe-listening-block-2",
          "format": "Written response",
          "purpose": "Practice",
          "title": "Written response",
          "instructions": "Take your time and try it yourself.",
          "text": "What does the customer order?",
          "translation": "I would like a coffee, please.",
          "answer": "Je voudrais un café",
          "alternatives": "",
          "words": [
            {
              "id": "cafe-listening-block-2-word-1",
              "word": "un café",
              "meaning": "a coffee",
              "picture": "☕",
              "pronunciation": "un café"
            },
            {
              "id": "cafe-listening-block-2-word-2",
              "word": "un thé",
              "meaning": "a tea",
              "picture": "🍵",
              "pronunciation": "un thé"
            }
          ],
          "parts": [
            {
              "id": "cafe-listening-block-2-part-1",
              "text": "Je",
              "role": "Subject",
              "note": "I"
            },
            {
              "id": "cafe-listening-block-2-part-2",
              "text": "voudrais",
              "role": "Verb",
              "note": "would like · vouloir, conditional"
            },
            {
              "id": "cafe-listening-block-2-part-3",
              "text": "un café",
              "role": "Object",
              "note": "Swap for un thé"
            }
          ],
          "pairs": [
            {
              "id": "cafe-listening-block-2-pair-1",
              "left": "un café",
              "right": "a coffee"
            },
            {
              "id": "cafe-listening-block-2-pair-2",
              "left": "un thé",
              "right": "a tea"
            }
          ],
          "choices": [
            "A coffee",
            "A ticket",
            "A book"
          ],
          "clips": [
            {
              "id": "cafe-listening-block-2-clip-1",
              "title": "Ordering a coffee",
              "transcript": "Qu’est-ce que vous voulez ?",
              "answer": "Je voudrais un café, s’il vous plaît."
            }
          ],
          "picture": "☕"
        }
      ]
    },
    {
      "id": "cafe-speaking",
      "type": "Speaking",
      "title": "Speaking",
      "goal": "Build confidence with speaking.",
      "minutes": 5,
      "blocks": [
        {
          "id": "cafe-speaking-block-1",
          "format": "Spoken response",
          "purpose": "Practice",
          "title": "Spoken response",
          "instructions": "Take your time and try it yourself.",
          "text": "Order a drink and ask whether you can pay by card.",
          "translation": "I would like a coffee, please.",
          "answer": "Je voudrais un café",
          "alternatives": "",
          "words": [
            {
              "id": "cafe-speaking-block-1-word-1",
              "word": "un café",
              "meaning": "a coffee",
              "picture": "☕",
              "pronunciation": "un café"
            },
            {
              "id": "cafe-speaking-block-1-word-2",
              "word": "un thé",
              "meaning": "a tea",
              "picture": "🍵",
              "pronunciation": "un thé"
            }
          ],
          "parts": [
            {
              "id": "cafe-speaking-block-1-part-1",
              "text": "Je",
              "role": "Subject",
              "note": "I"
            },
            {
              "id": "cafe-speaking-block-1-part-2",
              "text": "voudrais",
              "role": "Verb",
              "note": "would like · vouloir, conditional"
            },
            {
              "id": "cafe-speaking-block-1-part-3",
              "text": "un café",
              "role": "Object",
              "note": "Swap for un thé"
            }
          ],
          "pairs": [
            {
              "id": "cafe-speaking-block-1-pair-1",
              "left": "un café",
              "right": "a coffee"
            },
            {
              "id": "cafe-speaking-block-1-pair-2",
              "left": "un thé",
              "right": "a tea"
            }
          ],
          "choices": [
            "A coffee",
            "A ticket",
            "A book"
          ],
          "clips": [
            {
              "id": "cafe-speaking-block-1-clip-1",
              "title": "Ordering a coffee",
              "transcript": "Qu’est-ce que vous voulez ?",
              "answer": "Je voudrais un café, s’il vous plaît."
            }
          ],
          "picture": "☕"
        }
      ]
    },
    {
      "id": "cafe-reflection",
      "type": "Reflection",
      "title": "Reflection",
      "goal": "Build confidence with reflection.",
      "minutes": 5,
      "blocks": [
        {
          "id": "cafe-reflection-block-1",
          "format": "Lesson recap",
          "purpose": "Teach",
          "title": "Lesson recap",
          "instructions": "Explore the example, then make it your own.",
          "text": "You can now order a drink politely. Try replacing café with thé in your next conversation.",
          "translation": "I would like a coffee, please.",
          "answer": "Je voudrais un café",
          "alternatives": "",
          "words": [
            {
              "id": "cafe-reflection-block-1-word-1",
              "word": "un café",
              "meaning": "a coffee",
              "picture": "☕",
              "pronunciation": "un café"
            },
            {
              "id": "cafe-reflection-block-1-word-2",
              "word": "un thé",
              "meaning": "a tea",
              "picture": "🍵",
              "pronunciation": "un thé"
            }
          ],
          "parts": [
            {
              "id": "cafe-reflection-block-1-part-1",
              "text": "Je",
              "role": "Subject",
              "note": "I"
            },
            {
              "id": "cafe-reflection-block-1-part-2",
              "text": "voudrais",
              "role": "Verb",
              "note": "would like · vouloir, conditional"
            },
            {
              "id": "cafe-reflection-block-1-part-3",
              "text": "un café",
              "role": "Object",
              "note": "Swap for un thé"
            }
          ],
          "pairs": [
            {
              "id": "cafe-reflection-block-1-pair-1",
              "left": "un café",
              "right": "a coffee"
            },
            {
              "id": "cafe-reflection-block-1-pair-2",
              "left": "un thé",
              "right": "a tea"
            }
          ],
          "choices": [
            "A coffee",
            "A ticket",
            "A book"
          ],
          "clips": [
            {
              "id": "cafe-reflection-block-1-clip-1",
              "title": "Ordering a coffee",
              "transcript": "Qu’est-ce que vous voulez ?",
              "answer": "Je voudrais un café, s’il vous plaît."
            }
          ],
          "picture": "☕"
        }
      ]
    }
  ]
};
