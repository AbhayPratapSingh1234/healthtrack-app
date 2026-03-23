// Model Recommendations Analysis for Health Functions

const models = {
  'openrouter/polaris-alpha': {
    size: 'Unknown',
    capabilities: 'General purpose, strong performance',
    vision: false,
    speed: 'Medium',
    cost: 'Free'
  },
  'nvidia/nemotron-nano-12b-v2-vl:free': {
    size: '12B',
    capabilities: 'Vision-Language model, good for multimodal tasks',
    vision: true,
    speed: 'Medium',
    cost: 'Free'
  },
  'mistralai/mistral-small-3.2-24b-instruct:free': {
    size: '24B',
    capabilities: 'Strong reasoning, good context understanding',
    vision: false,
    speed: 'Medium',
    cost: 'Free'
  },
  'meta-llama/llama-4-maverick:free': {
    size: 'Unknown (Large)',
    capabilities: 'Very large model, excellent reasoning',
    vision: false,
    speed: 'Slow',
    cost: 'Free'
  },
  'meta-llama/llama-4-scout:free': {
    size: 'Unknown (Medium)',
    capabilities: 'Balanced performance and speed',
    vision: false,
    speed: 'Medium',
    cost: 'Free'
  },
  'qwen/qwen2.5-vl-32b-instruct:free': {
    size: '32B',
    capabilities: 'Vision-Language model, strong multimodal',
    vision: true,
    speed: 'Medium',
    cost: 'Free'
  },
  'mistralai/mistral-small-3.1-24b-instruct:free': {
    size: '24B',
    capabilities: 'Good general performance, tested and working',
    vision: false,
    speed: 'Medium',
    cost: 'Free'
  },
  'google/gemma-3-4b-it:free': {
    size: '4B',
    capabilities: 'Lightweight, fast responses',
    vision: false,
    speed: 'Fast',
    cost: 'Free'
  },
  'google/gemma-3-12b-it:free': {
    size: '12B',
    capabilities: 'Balanced size and performance',
    vision: false,
    speed: 'Medium',
    cost: 'Free'
  },
  'google/gemma-3-27b-it:free': {
    size: '27B',
    capabilities: 'Large model, strong capabilities',
    vision: false,
    speed: 'Medium',
    cost: 'Free'
  },
  'google/gemini-2.0-flash-exp:free': {
    size: 'Unknown',
    capabilities: 'Fast, modern Google model',
    vision: true,
    speed: 'Fast',
    cost: 'Free'
  }
};

console.log('=== MODEL RECOMMENDATIONS FOR HEALTH FUNCTIONS ===\n');

// Function requirements analysis
const functionRequirements = {
  'analyze-health-report': {
    needs: ['Vision capabilities for image analysis', 'Medical knowledge accuracy', 'Structured JSON output', 'High reliability for health data'],
    priority: 'VISION + MEDICAL ACCURACY'
  },
  'generate-recommendations': {
    needs: ['Strong reasoning', 'Context understanding', 'Health knowledge', 'Personalization capabilities'],
    priority: 'REASONING + CONTEXT'
  },
  'health-suggestions': {
    needs: ['Fast responses', 'Pattern matching', 'Structured output', 'Knowledge base'],
    priority: 'SPEED + ACCURACY'
  }
};

// Recommendations
const recommendations = {
  'analyze-health-report': [
    'qwen/qwen2.5-vl-32b-instruct:free (Vision + Large size + Strong multimodal)',
    'nvidia/nemotron-nano-12b-v2-vl:free (Vision capabilities + Good for analysis)',
    'google/gemini-2.0-flash-exp:free (Vision + Fast + Modern architecture)'
  ],
  'generate-recommendations': [
    'meta-llama/llama-4-maverick:free (Largest model + Best reasoning)',
    'mistralai/mistral-small-3.2-24b-instruct:free (Strong reasoning + Context understanding)',
    'google/gemma-3-27b-it:free (Large size + Good performance)'
  ],
  'health-suggestions': [
    'google/gemma-3-4b-it:free (Fastest + Lightweight + Good for simple tasks)',
    'google/gemini-2.0-flash-exp:free (Fast + Modern + Good knowledge)',
    'mistralai/mistral-small-3.1-24b-instruct:free (Already tested + Reliable)'
  ]
};

console.log('FUNCTION REQUIREMENTS:');
Object.entries(functionRequirements).forEach(([func, req]) => {
  console.log(`\n${func.toUpperCase()}:`);
  console.log(`Priority: ${req.priority}`);
  console.log(`Needs: ${req.needs.join(', ')}`);
});

console.log('\n=== RECOMMENDED MODELS ===');
Object.entries(recommendations).forEach(([func, models]) => {
  console.log(`\n${func.toUpperCase()}:`);
  models.forEach((model, i) => {
    console.log(`${i + 1}. ${model}`);
  });
});

console.log('\n=== TOP PICKS ===');
console.log('analyze-health-report: qwen/qwen2.5-vl-32b-instruct:free');
console.log('generate-recommendations: meta-llama/llama-4-maverick:free');
console.log('health-suggestions: google/gemma-3-4b-it:free');
