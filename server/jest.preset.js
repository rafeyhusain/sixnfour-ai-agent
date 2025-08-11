const nxPreset = require('@nx/jest/preset').default;

module.exports = { 
  ...nxPreset,
  // Set timeout to 0 for unlimited timeout (tests will never timeout)
  testTimeout: 0,
};
