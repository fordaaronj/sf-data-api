# Golden City Data

API for [goldencitydata.com](https://www.goldencitydata.com).

### Run

- Run the [scraper](https://github.com/fordaaronj/sf-data-server) to populate your database
- Add a `.env` file to the root directly and define `DATABASE_URL` as your Postgres database
- Run `app.js`
- To deploy, sign up with [Serverless](https://www.serverless.com/), define a `serverless.yml` file at the root directly, and run `sls deploy`

### Built With

- [Express](https://expressjs.com/)
- [Serverless](https://www.serverless.com/)