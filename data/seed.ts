import { prisma } from '../lib/prisma';
import { Candidate } from '../models/candidate';
import fs from 'fs';
import path from 'path';

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'candidates.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const candidates: Candidate[] = JSON.parse(rawData);

  for (const candidate of candidates) {
    await prisma.candidate.upsert({
      where: { id: candidate.id },
      update: candidate,
      create: candidate,
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
