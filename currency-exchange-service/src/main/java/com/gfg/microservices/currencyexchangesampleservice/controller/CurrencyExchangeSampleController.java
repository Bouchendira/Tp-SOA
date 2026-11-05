package com.gfg.microservices.currencyexchangesampleservice.controller;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import com.gfg.microservices.currencyexchangesampleservice.model.ExchangeValue;

@RestController
public class CurrencyExchangeSampleController {
 @Autowired private Environment environment;

 @GetMapping("/currency-exchange-sample/fromCurrency/{fromCurrency}/toCurrency/{toCurrency}")
 public ExchangeValue retrieveExchangeValue(@PathVariable String fromCurrency, @PathVariable String toCurrency) {
  BigDecimal conversionMultiple = null;
  ExchangeValue exchangeValue = null;
  if (fromCurrency != null && toCurrency != null) {
   if (fromCurrency.equalsIgnoreCase("USD") && toCurrency.equalsIgnoreCase("TND")) conversionMultiple = BigDecimal.valueOf(7);
   if (fromCurrency.equalsIgnoreCase("INR") && toCurrency.equalsIgnoreCase("TND")) conversionMultiple = BigDecimal.valueOf(0.013);
   if (fromCurrency.equalsIgnoreCase("EUR") && toCurrency.equalsIgnoreCase("INR")) conversionMultiple = BigDecimal.valueOf(82);
   if (fromCurrency.equalsIgnoreCase("AUD") && toCurrency.equalsIgnoreCase("INR")) conversionMultiple = BigDecimal.valueOf(54);
   if (conversionMultiple != null) {
    exchangeValue = new ExchangeValue(fromCurrency, toCurrency, conversionMultiple);
    exchangeValue.setPort(environment.getProperty("local.server.port", Integer.class, 0));
   }
  }
  return exchangeValue;
 }
}
