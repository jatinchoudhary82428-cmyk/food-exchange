// ShareBite System Configuration
module.exports = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  APP_NAME: 'ShareBite',
  VERSION: '1.0.0',
  DEFAULT_CITY: 'Metro City',
  // Food waste calculation constants
  KG_PER_SERVING: 0.4, // Average meal weight ~400g
  CO2_FACTOR_KG: 2.5,  // 2.5 kg CO2e saved per kg food rescued
  COMMUNITY_BASELINE_MEALS: 3200, // Historical community impact baseline
  COMMUNITY_BASELINE_KG: 1280
};
