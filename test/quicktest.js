#!/usr/bin/env node

/**
 * Quick standalone test script that can run without VS Code
 * Run with: node test/quicktest.js
 */

const crypto = require('crypto');
const assert = require('assert');

console.log('🧪 Running GUID Genie Quick Tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
        failed++;
    }
}

// test UUID generation
test('Generate valid UUID v4', () => {
    const uuid = crypto.randomUUID();
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assert(pattern.test(uuid), `UUID doesn't match v4 pattern: ${uuid}`);
});

// test uniqueness
test('Generate unique UUIDs', () => {
    const uuids = new Set();
    for (let i = 0; i < 1000; i++) {
        uuids.add(crypto.randomUUID());
    }
    assert.strictEqual(uuids.size, 1000);
});

// test case conversion
test('Convert to uppercase', () => {
    const lower = 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f56789';
    const upper = lower.toUpperCase();
    assert.strictEqual(upper, 'A1B2C3D4-E5F6-4789-A0B1-C2D3E4F56789');
});

// test brace formatting
test('Format with braces', () => {
    const uuid = 'A1B2C3D4-E5F6-4789-A0B1-C2D3E4F56789';
    const formatted = `{${uuid}}`;
    assert.strictEqual(formatted, '{A1B2C3D4-E5F6-4789-A0B1-C2D3E4F56789}');
});

// test GUID pattern detection
test('Detect valid GUID pattern', () => {
    const validGuids = [
        'A1B2C3D4-E5F6-4789-A0B1-C2D3E4F56789',
        'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f56789',
        '12345678-1234-4234-8234-123456789012'
    ];
    
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    validGuids.forEach(guid => {
        assert(pattern.test(guid), `Should accept valid GUID: ${guid}`);
    });
});

// test invalid GUID detection
test('Reject invalid GUID patterns', () => {
    const invalidGuids = [
        'not-a-guid',
        'A1B2C3D4-E5F6-4789-A0B1-C2D3E4F5678',  // too short
        'A1B2C3D4-E5F6-4789-A0B1-C2D3E4F567890', // too long
        'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',  // invalid hex
        'A1B2C3D4E5F64789A0B1C2D3E4F56789'       // no hyphens
    ];
    
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    invalidGuids.forEach(guid => {
        assert(!pattern.test(guid), `Should reject invalid GUID: ${guid}`);
    });
});

// test braced GUID detection
test('Detect braced GUIDs', () => {
    const bracedGuid = '{A1B2C3D4-E5F6-4789-A0B1-C2D3E4F56789}';
    const pattern = /^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/i;
    assert(pattern.test(bracedGuid), 'Should detect braced GUID');
});

// test performance
test('Generate 10000 UUIDs in under 1 second', () => {
    const start = Date.now();
    for (let i = 0; i < 10000; i++) {
        crypto.randomUUID();
    }
    const elapsed = Date.now() - start;
    assert(elapsed < 1000, `Took ${elapsed}ms to generate 10000 UUIDs`);
});

// test surrounding brace detection logic
test('Detect surrounding braces scenario', () => {
    const line = 'const id = {A1B2C3D4-E5F6-4789-A0B1-C2D3E4F56789};';
    const guidStart = 12;
    const guidEnd = 48;
    
    assert.strictEqual(line[guidStart - 1], '{');
    assert.strictEqual(line[guidEnd], '}');
});

// summary
console.log('\n' + '='.repeat(50));
console.log(`Tests completed: ${passed} passed, ${failed} failed`);

if (failed > 0) {
    console.log('❌ Some tests failed!');
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
    process.exit(0);
}