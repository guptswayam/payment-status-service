# Payment Status Microservice

**Tech Stack:** Typescript, NodeJS, Express, Postgresql, Kafka, Docker compose


**Run project locally:**: Get inside the project directory in terminal and run `docker-compose up --build`
- It will run the nodejs web server at port 7080 in your local machine


**Postman Collection:**: [Collection with just two routes](./payment-service.postman_collection.json)
    - HMAC signature will automatically be attached in required request using pre-request script.


## Trade-offs in time-pressure
1. Very limited observability(logging, tracing) and profiling
2. No handling for consumer message processing failures into dead letter queue
3. Missing Sharding (Horizontal) in Database as transanctions and events both will grow over time.
4. Missing batch processing of events in kakfa consumer worker.
5. Didn't wrote database migrations and using ORM synchronization. Also missing connection pooling configurations
6. It can handle the load and scale well but code level configuration and settings is not optimised in microservice and storage solution for production
7. Swagger Documentation and docstrings are missing
8. Very Limited Code Testing