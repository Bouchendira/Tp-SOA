package com.gfg.microservices.currencyexchangesampleservice.model;
import java.math.BigDecimal;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
@Entity
@Table(name = "Exchange_Value")
public class ExchangeValue {
 @Id @Column(name = "id") private Long id;
 @Column(name = "currency_from") private String fromCurrency;
 @Column(name = "currency_to") private String toCurrency;
 @Column(name = "conversion_multiple") private BigDecimal conversionMultiple;
 @Column(name = "port") private int port;
 public ExchangeValue() {}
 public ExchangeValue(Long id, String fromCurrency, String toCurrency, BigDecimal conversionMultiple) {
  super(); this.id=id; this.fromCurrency=fromCurrency; this.toCurrency=toCurrency; this.conversionMultiple=conversionMultiple;
 }
 public ExchangeValue(String fromCurrency, String toCurrency, BigDecimal conversionMultiple) {
  this.fromCurrency=fromCurrency; this.toCurrency=toCurrency; this.conversionMultiple=conversionMultiple;
 }
 public int getPort(){return port;} public void setPort(int port){this.port=port;}
 public Long getId(){return id;} public String getFrom(){return fromCurrency;} public String getTo(){return toCurrency;}
 public BigDecimal getConversionMultiple(){return conversionMultiple;}
}
