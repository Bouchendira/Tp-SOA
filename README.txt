TP3 - Original Exchange microservice + added Conversion microservice

PART A: currency-exchange-service is reconstructed from the TP screenshots: ExchangeValue, ExchangeRepository, ExchangeService, CurrencyExchangeSampleController. Original controller mappings and rates:
GET /currency-exchange-sample/fromCurrency/{fromCurrency}/toCurrency/{toCurrency}
USD->TND=7, INR->TND=0.013, EUR->INR=82, AUD->INR=54.

PART B: currency-conversion-service is the added second microservice. It calls exchange-service on localhost:8000 and multiplies rate by quantity.
GET http://localhost:8100/currency-conversion/from/USD/to/TND/quantity/10 => totalCalculatedAmount 70.

Run exchange service first, then conversion service. In each project: mvn clean install; mvn spring-boot:run.
