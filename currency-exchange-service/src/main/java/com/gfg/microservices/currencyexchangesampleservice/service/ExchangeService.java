package com.gfg.microservices.currencyexchangesampleservice.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.gfg.microservices.currencyexchangesampleservice.model.ExchangeValue;
import com.gfg.microservices.currencyexchangesampleservice.repository.ExchangeRepository;
@Service
public class ExchangeService {
 @Autowired private ExchangeRepository exchangeRepository;
 // CREATE
 public ExchangeValue createExchangeValue(ExchangeValue ex) { return exchangeRepository.save(ex); }
}
