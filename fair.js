/*
Title: Fairjs
Author: Disemerge

FairJS is a JavaScript library for generating provably fair numbers in online gambling and betting applications. 
It uses a combination of client seed, server seed, and nonce to generate random numbers within a specified range.
FairJS provides functions for generating integers, floats, and dice rolls, as well as utility functions for combining 
seeds and hashing data. Overall, FairJS is a simple and easy-to-use library that ensures fairness and transparency 
in online gambling and betting applications.
*/


const crypto = require('crypto')

module.exports = { 
    /**
     * Generates a random 256 long hex hash
     * 
     * @param   {string} clientSeed - the clientSeed
     * @param   {string} serverSeed - the serverSeed
     * @param   {number} nonce      - the nonce
     * @returns {string} combined string
    */
    combine: (client, server, nonce) => client + server + nonce,

    /**
     * Generates a sha512 hash from a string
     * 
     * @param   {string} string - input string
     * @returns {string} random 256 long string
    */
    sha512: string => crypto.createHash('sha512').update(string).digest('hex'),
    
    /**
     * Generates a random 256 long hex hash
     * 
     * @returns {string} random 256 long string
    */
    generateServerSeed: function() {
        return crypto.randomBytes(256).toString('hex')
    },

    /**
     * Converts a hex string to a Uint8Array of bytes.
     * @param {string} hex - The hex string to convert.
     * @returns {Uint8Array} The resulting byte array.
     */
    hexToBytes: function(hex) {
        const byteCount = hex.length / 2;
        const bytes = new Uint8Array(byteCount);

        for (let i = 0; i < byteCount; i++) {
            const byteHex = hex.substr(i * 2, 2);
            bytes[i] = parseInt(byteHex, 16);
        }
        return bytes;
    },
    /**
     * Generates an array of 32 random bytes using the given serverseed, clientseed, and nonce.
     *
     * @param {string} clientseed - The clientseed to use.
     * @param {string} serverseed - The serverseed to use.
     * @param {number} nonce - The nonce to use.
     * @returns {Uint8Array} - The generated bytes as a Uint8Array.
     */
    byteGenerator: function(clientseed, serverseed, nonce) {
        const preHash = this.combine(clientseed, serverseed, nonce);
        const hash    = this.sha512(preHash);
        return this.hexToBytes(hash.slice(0, 64));
    },

    /**
     * Generates a random integer between min and max using the specified client seed, server seed, and nonce.
     *
     * @param {string} clientSeed - The client seed.
     * @param {string} serverSeed - The server seed.
     * @param {number} nonce - The nonce.
     * @param {number} min - The minimum value of the range.
     * @param {number} max - The maximum value of the range.
     * @returns {number} A random integer between min and max (inclusive).
     */
    generateInteger: function(clientSeed, serverSeed, nonce, min, max) {
        const preHash = this.combine(clientSeed, serverSeed, nonce)
        const hash    = this.sha512(preHash)
        const range   = max - min + 1

        return parseInt(hash.slice(0, 8), 16) % range + min;
    },


    /**
     * Generates a random float between 0 and 1 using the fairjs library.
     * @param {string} clientSeed - The client seed to use for the random number generation.
     * @param {string} serverSeed - The server seed to use for the random number generation.
     * @param {number} nonce - The nonce to use for the random number generation.
     * @param {number} [precision=2] - The number of decimal places to include in the result.
     * @returns {number} - The random float between 0 and 1.
     */
    generateFloats: function(clientSeed, serverSeed, nonce, precision = 2) {
        const bytes = this.byteGenerator(clientSeed, serverSeed, nonce);
        const float = parseFloat("0." + bytes.join(""), 10);

        return parseFloat(float.toFixed(precision));
    },

    /**
     *  Generates a random boolean using the specified client seed, server seed, and nonce.
     * 
     * @param {string} clientSeed - The client seed.
     * @param {string} serverSeed - The server seed.
     * @param {number} nonce       - The nonce.
     * @returns {float, boolean} random boolean true/false
    */
    generateBool: function(clientSeed, serverSeed, nonce) {
        // Returns the generated float and result.
        return this.generateFloats(clientSeed, serverSeed, nonce, 10), this.generateFloats(clientSeed, serverSeed, nonce, 10) <= 0.5 ? true : false
    },

    /**
     * Selects a random object from an array of objects based on their probabilities.
     *
     * @param {string} clientSeed - The client seed.
     * @param {string} serverSeed - The server seed.
     * @param {number} nonce      - The nonce.
     * @param {Array}  objects    - An array of objects with an ID and a probability property.
     * @returns {String} The ID of the randomly selected object.
     */
    selectRandomObject: function(clientSeed, serverSeed, nonce, objects) {
        let totalProbability = 0;
        for (const obj of objects) {
            totalProbability += obj.probability;
        }
    
        const normalizedProbabilities = objects.map(obj => obj.probability / totalProbability);
    
        const randomFloat = this.generateFloats(clientSeed, serverSeed, nonce, 10);

        let index = 0;
        for (let i = 0; i < normalizedProbabilities.length; i++) {
            index += normalizedProbabilities[i];
            if (randomFloat < index) {
                return objects[i];
            }
        }
    
        // If no object is selected, return null
        return null;
    },


}
