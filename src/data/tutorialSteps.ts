// Tutorial step definitions for the Arcane Machine Codex Workshop
// ROUND 80 MIGRATION: Reduced from 8 to 5 steps per contract specification

export interface TutorialStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action: 'wait' | 'click' | 'drag' | 'connect' | 'none';
  actionDescription?: string;
  expectedResult?: string;
  highlightPadding?: number;
}

// REDUCED TO 5 STEPS per Round 80 contract specification:
// 1. Place module
// 2. Connect modules
// 3. Activate machine
// 4. Save to codex
// 5. Export
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'place-module',
    stepNumber: 0,
    title: 'Place Your First Module',
    description: 'Drag the Core Furnace from the palette and drop it onto the canvas. The Core Furnace is the heart of your machine!',
    targetSelector: '[data-tutorial="canvas"]',
    position: 'top',
    action: 'drag',
    actionDescription: 'Drag any module from the panel and drop it on the canvas',
    expectedResult: 'Module appears on canvas and becomes selected',
  },
  {
    id: 'connect-modules',
    stepNumber: 1,
    title: 'Connect Your Modules',
    description: 'Modules can be connected by dragging from one port to another. Click on a module\'s output port (marked with an arrow) and drag to another module\'s input port.',
    targetSelector: '[data-tutorial="canvas"]',
    position: 'top',
    action: 'connect',
    actionDescription: 'Click on a port and drag to another port to create a connection',
    expectedResult: 'Energy path appears connecting the two modules',
  },
  {
    id: 'activate-machine',
    stepNumber: 2,
    title: 'Activate Your Machine',
    description: 'Once you have your machine set up, click the "Activate Machine" button to see your creation come to life!',
    targetSelector: '[data-tutorial="activate-button"]',
    position: 'bottom',
    action: 'click',
    actionDescription: 'Click the Activate Machine button',
    expectedResult: 'Machine enters activation state with animations',
  },
  {
    id: 'save-to-codex',
    stepNumber: 3,
    title: 'Save to Your Codex',
    description: 'Save your masterpiece to the Codex! This creates a permanent record of your machine with auto-generated name, rarity, and attributes.',
    targetSelector: '[data-tutorial="save-button"]',
    position: 'bottom',
    action: 'click',
    actionDescription: 'Click the Save to Codex button',
    expectedResult: 'Machine is saved with generated attributes',
  },
  {
    id: 'export-share',
    stepNumber: 4,
    title: 'Export and Share',
    description: 'Export your machine as an SVG or PNG image, or generate a shareable poster card! Perfect for showcasing your creation.',
    targetSelector: '[data-tutorial="export-button"]',
    position: 'bottom',
    action: 'click',
    actionDescription: 'Click Export to see sharing options',
    expectedResult: 'Export modal opens with SVG, PNG, and poster options',
  },
];

export const getStepById = (id: string): TutorialStep | undefined => {
  return TUTORIAL_STEPS.find(step => step.id === id);
};

export const getStepByNumber = (stepNumber: number): TutorialStep | undefined => {
  return TUTORIAL_STEPS.find(step => step.stepNumber === stepNumber);
};

export const TOTAL_TUTORIAL_STEPS = TUTORIAL_STEPS.length;

// Welcome modal content
export const WELCOME_CONTENT = {
  title: 'Welcome, Arcane Architect!',
  subtitle: 'Your journey into the Arcane Machine Codex begins now.',
  description: 'You are about to enter a realm where arcane energy and mechanical precision combine to create wondrous machines. Before you begin your creative journey, would you like a guided tour of the workshop?',
  features: [
    { icon: '🔮', title: 'Build & Create', description: 'Drag, rotate, and connect magical modules' },
    { icon: '⚡', title: 'Activate & Watch', description: 'Bring your machines to life with animations' },
    { icon: '📖', title: 'Collect & Discover', description: 'Save creations to your personal codex' },
    { icon: '🏆', title: 'Challenge Mode', description: 'Complete challenges to earn rewards' },
  ],
  startTutorial: 'Start Tutorial',
  skipTutorial: 'Skip & Explore',
};

// Tutorial completion content
export const COMPLETION_CONTENT = {
  title: 'Tutorial Complete!',
  subtitle: 'Congratulations, Arcane Architect!',
  message: 'You\'ve learned the basics of the Arcane Machine Codex. Now it\'s time to unleash your creativity and build amazing magical machines!',
  tips: [
    'Tip: Use the Random Forge to generate inspiration',
    'Tip: Connect modules to improve machine attributes',
    'Tip: Save rare machines to your codex for collection',
  ],
  continue: 'Start Building',
  replayTutorial: 'Replay Tutorial',
};
