import dotenv from 'dotenv'

const envFile = `.env.${process.env.NODE_ENV || 'development'}`
console.log(envFile)
dotenv.config({ path: envFile })
