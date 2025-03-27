import dotenv from 'dotenv';

dotenv.config();

console.log('Firebase Configuration Check:');
console.log('----------------------------');
console.log('Project ID:', process.env.Project_id);
console.log('Project ID valid:', process.env.Project_id && !process.env.Project_id.includes('"') && !process.env.Project_id.includes(' '));

// Check if running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\nTo fix any issues:');
  console.log('1. Make sure Project_id in .env has no quotes or spaces');
  console.log('2. It should look like: Project_id=hostel-mess-11f93');
  console.log('3. Current value might have extra characters that need to be removed');
} 