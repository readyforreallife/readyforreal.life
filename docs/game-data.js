const OBJECTIVES = {
  regulation:
    "Given a real-life pressure scenario, students will identify and apply a regulated first response that protects judgment and self-control with at least 80% accuracy.",
  communication:
    "Given a real-life interpersonal scenario, students will identify and apply a respectful communication response that protects dignity and clarity with at least 80% accuracy.",
  accountability:
    "Given a mistake, conflict, or integrity scenario, students will identify and apply an accountable repair move with at least 80% accuracy.",
  digital:
    "Given a digital or reputation-based scenario, students will identify and apply the strongest online decision with at least 80% accuracy.",
  decision:
    "Given a real-life scenario with competing pressures, students will identify and apply the strongest decision based on long-term consequence and character with at least 80% accuracy."
};

window.RFRL_GAME_QUESTIONS = [
  {
    category: "Hallway Pressure",
    theme: "Conflict",
    bloom: "Applying",
    objective: OBJECTIVES.regulation,
    prompt: "You get mocked in front of a crowd between classes, and your first instinct is to fire back loudly. What is the strongest first move?",
    choices: [
      "Pause and steady yourself before you answer",
      "Match the energy so you do not look weak",
      "Post about it before they do",
      "Shove past them and walk off"
    ],
    answer: 0,
    correctAnswer: "A. Pause and steady yourself before you answer",
    explanation: "The strongest move is to regulate first so your response comes from control rather than impulse.",
    bloomExplanation: "This is Applying because the player must use a regulation principle in a realistic social-pressure scenario, not simply recall a definition."
  },
  {
    category: "Group Chat",
    theme: "Digital",
    bloom: "Applying",
    objective: OBJECTIVES.digital,
    prompt: "A group chat is roasting someone who is not in it. You know one screenshot could spread everywhere. What is the best move?",
    choices: [
      "Add one comment and then leave the chat",
      "Screenshot it and send it around",
      "Stop your part in it and redirect the chat",
      "Ignore it because it is not about you"
    ],
    answer: 2,
    correctAnswer: "C. Stop your part in it and redirect the chat",
    explanation: "The strongest move is to stop adding harm and push the situation away from humiliation instead of feeding it.",
    bloomExplanation: "This is Applying because the player must choose how to act in a realistic digital citizenship scenario with social consequences."
  },
  {
    category: "Classroom Conflict",
    theme: "Conflict",
    bloom: "Applying",
    objective: OBJECTIVES.communication,
    prompt: "A teacher corrects you in class and you feel embarrassed. What response keeps your standing and your options open?",
    choices: [
      "Roll your eyes and vent later",
      "Argue in front of everyone",
      "Stay composed and talk after class",
      "Refuse to join the lesson"
    ],
    answer: 2,
    correctAnswer: "C. Stay composed and talk after class",
    explanation: "A private follow-up protects respect and gives you room to address the issue without turning it into a public contest.",
    bloomExplanation: "This is Applying because the player must select the strongest communication response for a classroom moment, not just identify a rule."
  },
  {
    category: "Workplace Readiness",
    theme: "Work",
    bloom: "Applying",
    objective: OBJECTIVES.accountability,
    prompt: "You are late to a shift and your manager asks what happened. Which response shows the most maturity?",
    choices: [
      "Blame traffic even if you left late",
      "Own it and explain your fix",
      "Say nothing and hope it passes",
      "Say everybody runs late sometimes"
    ],
    answer: 1,
    correctAnswer: "B. Own it and explain your fix",
    explanation: "Owning the mistake and naming a plan to prevent it next time builds trust more than excuses do.",
    bloomExplanation: "This is Applying because the player must choose the strongest accountability response in a work scenario."
  },
  {
    category: "Friend Loyalty",
    theme: "Peer Pressure",
    bloom: "Applying",
    objective: OBJECTIVES.accountability,
    prompt: "A friend wants you to lie for them so they can avoid consequences. What is the strongest move?",
    choices: [
      "Cover for them this one time",
      "Refuse to lie and help them face it",
      "Lie now and warn them later",
      "Avoid both sides completely"
    ],
    answer: 1,
    correctAnswer: "B. Refuse to lie and help them face it",
    explanation: "Strong loyalty does not mean helping someone dig deeper. Support plus honesty is stronger than cover-up.",
    bloomExplanation: "This is Applying because the player must use a principle of accountability in a friendship scenario with pressure."
  },
  {
    category: "Online Reputation",
    theme: "Digital",
    bloom: "Applying",
    objective: OBJECTIVES.digital,
    prompt: "You are about to post something funny, but it also makes a teacher, coach, or employer look foolish. What is the best call?",
    choices: [
      "Post it because humor matters most",
      "Post it now and delete it later",
      "Hold it and weigh the long-term cost",
      "Send it only to a private story"
    ],
    answer: 2,
    correctAnswer: "C. Hold it and weigh the long-term cost",
    explanation: "The stronger question is whether the post is worth your name on it later, not whether it gets laughs right now.",
    bloomExplanation: "This is Applying because the player must judge a realistic digital decision using long-term consequence."
  },
  {
    category: "Dating Respect",
    theme: "Relationships",
    bloom: "Applying",
    objective: OBJECTIVES.communication,
    prompt: "Someone you like stops responding. Your emotions spike and you want to send several demanding messages. What is the strongest response?",
    choices: [
      "Send everything while the feeling is hot",
      "Ask friends to message them too",
      "Pause and choose one respectful move",
      "Post something indirect online"
    ],
    answer: 2,
    correctAnswer: "C. Pause and choose one respectful move",
    explanation: "Strong communication is grounded, respectful, and deliberate even when your emotions want speed.",
    bloomExplanation: "This is Applying because the player must use respectful communication in a relationship scenario under emotional stress."
  },
  {
    category: "Rumor Control",
    theme: "Conflict",
    bloom: "Applying",
    objective: OBJECTIVES.decision,
    prompt: "You hear someone is spreading a false rumor about you. What is the strongest first move?",
    choices: [
      "Start a rumor back at them",
      "Confront them publicly right away",
      "Get clear on the facts and respond calmly",
      "Cut off everyone connected to them"
    ],
    answer: 2,
    correctAnswer: "C. Get clear on the facts and respond calmly",
    explanation: "Clarity gives you control. Reacting before you know what is real usually creates more damage, not less.",
    bloomExplanation: "This is Applying because the player must decide how to respond in a live social conflict with incomplete information."
  },
  {
    category: "Family Stress",
    theme: "Family",
    bloom: "Applying",
    objective: OBJECTIVES.regulation,
    prompt: "You had a bad morning at home and now someone at school says one small thing that sets you off. What is the strongest move?",
    choices: [
      "Unload on them because you are full",
      "Notice the stress and stop the spillover",
      "Walk out and let people guess why",
      "Pretend nothing is wrong and blow up later"
    ],
    answer: 1,
    correctAnswer: "B. Notice the stress and stop the spillover",
    explanation: "A strong move is recognizing what you are carrying so you do not pass your pressure to the next person.",
    bloomExplanation: "This is Applying because the player must interpret a stress response and choose a regulation-based action in context."
  },
  {
    category: "Leadership",
    theme: "School",
    bloom: "Applying",
    objective: OBJECTIVES.communication,
    prompt: "You are leading a group project and one person keeps doing almost nothing. What is the strongest response?",
    choices: [
      "Trash them in the group chat",
      "Do the work and stay resentful",
      "Address it directly and early",
      "Wait until the grade comes back"
    ],
    answer: 2,
    correctAnswer: "C. Address it directly and early",
    explanation: "Leadership means handling tension while there is still time to change the outcome.",
    bloomExplanation: "This is Applying because the player must choose the strongest leadership move in a realistic collaboration problem."
  },
  {
    category: "Public Behavior",
    theme: "School",
    bloom: "Understanding",
    objective: OBJECTIVES.decision,
    prompt: "A younger student is watching how you treat staff when something goes wrong. What matters most in that moment?",
    choices: [
      "Winning the argument",
      "Showing character under pressure",
      "Making your friends laugh",
      "Getting the last word"
    ],
    answer: 1,
    correctAnswer: "B. Showing character under pressure",
    explanation: "One of the deepest themes in the course is that character has to show up when pressure is real, not only when the moment is easy.",
    bloomExplanation: "This is Understanding because the player must interpret what the moment is really testing, not just recall a term."
  },
  {
    category: "Repair",
    theme: "Conflict",
    bloom: "Applying",
    objective: OBJECTIVES.accountability,
    prompt: "You realize you were the one who escalated a situation. What repair move is strongest?",
    choices: [
      "Wait and hope it fades",
      "Say sorry but change nothing",
      "Own it and change the behavior",
      "Explain why they caused it"
    ],
    answer: 2,
    correctAnswer: "C. Own it and change the behavior",
    explanation: "Repair is not only apology language. It is ownership plus follow-through that matches the apology.",
    bloomExplanation: "This is Applying because the player must choose the strongest accountability action in a specific repair scenario."
  },
  {
    category: "Peer Pressure",
    theme: "Peer Pressure",
    bloom: "Applying",
    objective: OBJECTIVES.decision,
    prompt: "Friends pressure you to help humiliate someone because 'it is not that serious.' What is the strongest response?",
    choices: [
      "Join in lightly to stay safe",
      "Stay quiet and let it happen",
      "Refuse to add to the harm",
      "Laugh now and apologize later"
    ],
    answer: 2,
    correctAnswer: "C. Refuse to add to the harm",
    explanation: "The strongest choices are not always the easiest socially, but they protect integrity and keep harm from growing.",
    bloomExplanation: "This is Applying because the player must decide what to do under peer pressure rather than identify a concept."
  },
  {
    category: "Decision Moment",
    theme: "Mixed",
    bloom: "Applying",
    objective: OBJECTIVES.decision,
    prompt: "You have two real options, and both come with a cost. What should guide you most?",
    choices: [
      "What feels easiest right now",
      "What makes you look toughest",
      "What fits your long-term values",
      "What gets the biggest reaction"
    ],
    answer: 2,
    correctAnswer: "C. What fits your long-term values",
    explanation: "Strong decisions are about consequence, integrity, and the future version of you, not just short-term relief.",
    bloomExplanation: "This is Applying because the player must use a decision principle in a realistic high-pressure choice."
  },
  {
    category: "Digital Citizenship",
    theme: "Digital",
    bloom: "Applying",
    objective: OBJECTIVES.digital,
    prompt: "Someone sends you a private photo or message that would get attention if shared. What is the strongest response?",
    choices: [
      "Share it with one trusted friend",
      "Save it for leverage later",
      "Keep the content private",
      "Use it if they make you mad"
    ],
    answer: 2,
    correctAnswer: "C. Keep the content private",
    explanation: "Trust, privacy, and restraint matter more than attention. Passing private content around damages both people and reputation.",
    bloomExplanation: "This is Applying because the player must act on a digital ethics principle in a realistic online situation."
  },
  {
    category: "Respectful Communication",
    theme: "Conflict",
    bloom: "Applying",
    objective: OBJECTIVES.communication,
    prompt: "You strongly disagree with someone in class. Which response is strongest?",
    choices: [
      "Interrupt until they stop",
      "Disagree without disrespect",
      "Mock the idea in public",
      "Shut down and withdraw"
    ],
    answer: 1,
    correctAnswer: "B. Disagree without disrespect",
    explanation: "Strong communication is not silence or aggression. It is staying clear and respectful while still being honest.",
    bloomExplanation: "This is Applying because the player must choose how to behave in a real disagreement, not define respectful communication."
  },
  {
    category: "Coaching Moment",
    theme: "Family",
    bloom: "Understanding",
    objective: OBJECTIVES.decision,
    prompt: "A younger student or sibling copies what they see you do online. What is the strongest standard to hold yourself to?",
    choices: [
      "If it is funny, it is fine",
      "If others do it, it works",
      "Model what you would want copied",
      "Behave well only when watched"
    ],
    answer: 2,
    correctAnswer: "C. Model what you would want copied",
    explanation: "Leadership shows up in example. If someone repeated your exact behavior, it should still match your standards.",
    bloomExplanation: "This is Understanding because the player must interpret the broader principle of modeling and influence in a realistic situation."
  },
  {
    category: "Conflict Navigation",
    theme: "Conflict",
    bloom: "Applying",
    objective: OBJECTIVES.regulation,
    prompt: "A conversation is getting hotter by the second and both people keep cutting each other off. What is the strongest move?",
    choices: [
      "Raise your voice to get heard",
      "Slow the pace and reset",
      "Threaten to expose them",
      "Keep pushing until someone wins"
    ],
    answer: 1,
    correctAnswer: "B. Slow the pace and reset",
    explanation: "When pace speeds up, judgment usually drops. Slowing the moment can save the whole interaction.",
    bloomExplanation: "This is Applying because the player must use a regulation and communication move inside an escalating conflict."
  },
  {
    category: "Integrity",
    theme: "Work",
    bloom: "Understanding",
    objective: OBJECTIVES.accountability,
    prompt: "You can either look good immediately or do the harder thing that is right. What is the stronger choice?",
    choices: [
      "Protect the image first",
      "Choose the harder right",
      "Do what cannot be proven",
      "Avoid the decision altogether"
    ],
    answer: 1,
    correctAnswer: "B. Choose the harder right",
    explanation: "This curriculum is not just about image. It is about integrity under pressure, especially when the right move costs something.",
    bloomExplanation: "This is Understanding because the player must recognize the deeper value principle the situation is testing."
  },
  {
    category: "Pressure Test",
    theme: "Mixed",
    bloom: "Applying",
    objective: OBJECTIVES.regulation,
    prompt: "If pressure is high, emotions are loud, and everybody is watching, what is usually the strongest first move?",
    choices: [
      "React quickly to control the story",
      "Pause long enough to regain control",
      "Say something harsh first",
      "Walk away and never address it"
    ],
    answer: 1,
    correctAnswer: "B. Pause long enough to regain control",
    explanation: "That is the heart of the course. Under pressure, regulation first creates the conditions for a stronger decision.",
    bloomExplanation: "This is Applying because the player must choose the first action that fits a high-pressure real-life moment."
  }
];
