package com.gfg.microservices.currencyconversionservice.service;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.gfg.microservices.currencyconversionservice.model.CurrencyConversion;

@Service
public class CurrencyConversionService {
    @Autowired
    private RestTemplate restTemplate;

    public CurrencyConversion convert(String from, String to, BigDecimal quantity) {
        String url = "http://localhost:8000/currency-exchange-sample/fromCurrency/{from}/toCurrency/{to}";
        Map exchange = restTemplate.getForObject(url, Map.class, from, to);
        BigDecimal rate = new BigDecimal(exchange.get("conversionMultiple").toString());
        return new CurrencyConversion(Long.valueOf(exchange.get("id").toString()), from, to, rate, Integer.parseInt(exchange.get("port").toString()), quantity, quantity.multiply(rate));
    }
}
