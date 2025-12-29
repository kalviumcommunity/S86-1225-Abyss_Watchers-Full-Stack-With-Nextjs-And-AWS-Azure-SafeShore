const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main(){
  try{
    const res = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log('DB CHECK OK:', res);
    await prisma.$disconnect();
    process.exit(0);
  }catch(e){
    console.error('DB CHECK ERROR:', e.message || e);
    try{ await prisma.$disconnect(); }catch(_){}
    process.exit(1);
  }
}

main();
