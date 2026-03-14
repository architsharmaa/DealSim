import mongoose from 'mongoose';
import EvaluationFramework from '../models/EvaluationFramework.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dealsim';

const frameworks = [
  {
    name: 'MEDDIC',
    description: 'A B2B sales methodology focusing on qualifying complex deals.',
    isBuiltIn: true,
    competencies: [
      {
        name: 'Metrics',
        description: 'The quantifiable economic impact of the solution.',
        weight: 15,
        scoringGuidelines: '0: No metrics identified. 5: Solid ROI case quantified.'
      },
      {
        name: 'Economic Buyer',
        description: 'The person who has the final authority to release funds.',
        weight: 15,
        scoringGuidelines: '0: Economic buyer unknown. 5: Direct access or validated sponsor.'
      },
      {
        name: 'Decision Criteria',
        description: 'The technical, vendor, and financial criteria for the purchase.',
        weight: 15,
        scoringGuidelines: '0: Criteria vague. 5: Explicitly detailed and agreed upon.'
      },
      {
        name: 'Decision Process',
        description: 'The internal steps and timeline once a preference is formed.',
        weight: 15,
        scoringGuidelines: '0: Process unknown. 5: Every stakeholder and step identified.'
      },
      {
        name: 'Identify Pain',
        description: 'The critical business problem that the solution solves.',
        weight: 20,
        scoringGuidelines: '0: Surface level pain. 5: Compelling event and negative impact mapped.'
      },
      {
        name: 'Champion',
        description: 'A powerful person within the organization who sells on your behalf.',
        weight: 20,
        scoringGuidelines: '0: No champion. 5: Validated champion with influence and interest.'
      }
    ]
  },
  {
    name: 'BANT',
    description: 'A classic qualification framework focusing on Budget, Authority, Need, and Timeline.',
    isBuiltIn: true,
    competencies: [
      {
        name: 'Budget',
        description: 'Determine if the prospect has the funds available.',
        weight: 25,
        scoringGuidelines: '0: No budget talk. 5: Budget confirmed and allocated.'
      },
      {
        name: 'Authority',
        description: 'Identify the decision makers and influencers.',
        weight: 25,
        scoringGuidelines: '0: Talking to wrong person. 5: Decision maker identified.'
      },
      {
        name: 'Need',
        description: 'Assess if the prospect has a specific problem your product solves.',
        weight: 25,
        scoringGuidelines: '0: No clear need. 5: Critical need identified.'
      },
      {
        name: 'Timeline',
        description: 'Find out the timeframe for the purchase.',
        weight: 25,
        scoringGuidelines: '0: No timeline. 5: Immediate or defined project date.'
      }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const fw of frameworks) {
      await EvaluationFramework.findOneAndUpdate(
        { name: fw.name },
        fw,
        { upsert: true, new: true }
      );
      console.log(`Seeded ${fw.name} framework`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
