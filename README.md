# Create a HTTPS NodeJS MySQL GraphQL Server

Don't forget to run `yarn` to install the dependencies. You can find out how to install Yarn on their [website](https://yarnpkg.com).

Run the development server using `nodemon src`

You can watch the original was created this on [YouTube](https://www.youtube.com/watch?v=0hOi7biFLf0).

This fork converts the Monogo/Mongoose backend to a MySQL/Sequelize backend. And adds local https development with self-generated cert you'll need to provide an exception for. There is a setting to allow unverified certificates in Postman. Please DO NOT use the provided cert/key in any production environment, use free valid certs from letsencrypt.org.

You can either force Sequelize to drop/create the table on first run or you can simply create the `events` table yourself, after creating your database.

Create something awesome!
