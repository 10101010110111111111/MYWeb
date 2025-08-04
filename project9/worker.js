// Poker Calculator Web Worker
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch (type) {
        case 'calculate':
            const results = calculateBatch(data);
            self.postMessage({ type: 'results', data: results });
            break;
        case 'generateCombinations':
            const combinations = generateCombinations(data.deck, data.r);
            self.postMessage({ type: 'combinations', data: combinations });
            break;
    }
};

function calculateBatch(data) {
    const { combinations, activePlayers, communityCards, startIndex, endIndex } = data;
    const results = activePlayers.map(player => ({
        player,
        wins: 0,
        ties: 0,
        total: 0,
        handStats: {
            'Royal flush': 0,
            'Straight flush': 0,
            'Four-of-a-Kind': 0,
            'Full house': 0,
            'Flush': 0,
            'Straight': 0,
            'Three-of-a-Kind': 0,
            'Two pair': 0,
            'One pair': 0,
            'High card': 0
        }
    }));
    
    for (let i = startIndex; i < endIndex && i < combinations.length; i++) {
        const combination = combinations[i];
        const completedBoard = [
            ...communityCards,
            ...combination
        ];
        
        // Record hand statistics for each player
        activePlayers.forEach((player, index) => {
            const hand = evaluateHand([...player.cards, ...completedBoard]);
            const handName = getHandDisplayName(hand.name);
            if (results[index].handStats[handName] !== undefined) {
                results[index].handStats[handName]++;
            }
        });
        
        const winner = evaluateWinner(activePlayers, completedBoard);
        
        if (winner === 'tie') {
            results.forEach(r => r.ties++);
        } else {
            results[winner].wins++;
        }
        results.forEach(r => r.total++);
    }
    
    return results;
}

function generateCombinations(deck, r) {
    if (r === 0) return [[]];
    if (r > deck.length) return [];
    
    const combinations = [];
    const indices = Array.from({length: r}, (_, i) => i);
    
    // Generate first combination
    combinations.push(indices.map(i => deck[i]));
    
    // Generate next combinations
    while (true) {
        let i = r - 1;
        
        // Find rightmost element to increment
        while (i >= 0 && indices[i] === deck.length - r + i) {
            i--;
        }
        
        if (i < 0) break; // No more combinations
        
        indices[i]++;
        
        // Update remaining elements
        for (let j = i + 1; j < r; j++) {
            indices[j] = indices[j - 1] + 1;
        }
        
        combinations.push(indices.map(i => deck[i]));
    }
    
    return combinations;
}

function evaluateHand(cards) {
    const values = cards.map(c => getCardValue(c.value));
    const suits = cards.map(c => c.suit);
    
    // Count value frequencies
    const valueCounts = {};
    values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
    
    // Get sorted values for kicker comparison
    const sortedValues = [...values].sort((a, b) => b - a);
    
    // Check for flush
    const flush = checkFlush(suits);
    
    // Check for straight
    const straight = checkStraight(values);
    
    // Determine hand rank and get kickers
    if (flush && straight) {
        const straightHigh = getStraightHigh(values);
        // Check for Royal Flush: exactly 10-J-Q-K-A of the same suit
        const isRoyal = isRoyalFlush(values, suits);
        return { 
            rank: isRoyal ? 9 : 8, 
            name: isRoyal ? 'Royal Flush' : 'Straight Flush', 
            kickers: [straightHigh]
        };
    } else if (hasFourOfAKind(valueCounts)) {
        const fourValue = getFourOfAKindValue(valueCounts);
        const kicker = sortedValues.find(v => v !== fourValue) || 0;
        return { 
            rank: 7, 
            name: 'Four of a Kind', 
            kickers: [fourValue, kicker]
        };
    } else if (hasFullHouse(valueCounts)) {
        const threeValues = getThreeOfAKindValues(valueCounts);
        const pairValues = getPairValues(valueCounts, threeValues[0]);
        
        // Use highest three of a kind and highest pair
        const threeValue = Math.max(...threeValues);
        const pairValue = Math.max(...pairValues);
        
        return { 
            rank: 6, 
            name: 'Full House', 
            kickers: [threeValue, pairValue]
        };
    } else if (flush) {
        const flushValues = getFlushValues(values, suits);
        return { 
            rank: 5, 
            name: 'Flush', 
            kickers: flushValues
        };
    } else if (straight) {
        const straightHigh = getStraightHigh(values);
        return { 
            rank: 4, 
            name: 'Straight', 
            kickers: [straightHigh]
        };
    } else if (hasThreeOfAKind(valueCounts)) {
        const threeValue = getThreeOfAKindValue(valueCounts);
        const kickers = sortedValues.filter(v => v !== threeValue).slice(0, 2);
        return { 
            rank: 3, 
            name: 'Three of a Kind', 
            kickers: [threeValue, ...kickers]
        };
    } else if (hasTwoPair(valueCounts)) {
        const pairs = getTwoPairValues(valueCounts);
        const kicker = sortedValues.find(v => !pairs.includes(v)) || 0;
        return { 
            rank: 2, 
            name: 'Two Pair', 
            kickers: [...pairs, kicker]
        };
    } else if (hasOnePair(valueCounts)) {
        const pairValue = getPairValue(valueCounts);
        const kickers = sortedValues.filter(v => v !== pairValue).slice(0, 3);
        return { 
            rank: 1, 
            name: 'One Pair', 
            kickers: [pairValue, ...kickers]
        };
    } else {
        // High card
        return { 
            rank: 0, 
            name: 'High Card', 
            kickers: sortedValues.slice(0, 5)
        };
    }
}

function evaluateWinner(activePlayers, completedBoard) {
    const playerHands = activePlayers.map(player => ({
        player,
        hand: evaluateHand([...player.cards, ...completedBoard])
    }));
    
    return findWinner(playerHands);
}

function findWinner(playerHands) {
    if (playerHands.length === 0) return null;
    if (playerHands.length === 1) return 0;
    
    let bestRank = -1;
    let bestHands = [];
    
    // Single pass to find best rank and collect candidates
    for (let i = 0; i < playerHands.length; i++) {
        const { player, hand } = playerHands[i];
        if (hand.rank > bestRank) {
            bestRank = hand.rank;
            bestHands = [{ player, hand, index: i }];
        } else if (hand.rank === bestRank) {
            bestHands.push({ player, hand, index: i });
        }
    }
    
    if (bestHands.length === 1) {
        return bestHands[0].index;
    }
    
    // Multiple hands with same rank, compare kickers
    return compareHands(bestHands);
}

function compareHands(hands) {
    const maxKickerLength = Math.max(...hands.map(h => h.hand.kickers.length));
    
    for (let i = 0; i < maxKickerLength; i++) {
        let maxValue = -1;
        let winners = [];
        
        hands.forEach(({ player, hand }) => {
            const kickerValue = hand.kickers[i] || 0;
            if (kickerValue > maxValue) {
                maxValue = kickerValue;
                winners = [player];
            } else if (kickerValue === maxValue) {
                winners.push(player);
            }
        });
        
        if (winners.length === 1) {
            return winners[0];
        }
    }
    
    return 'tie';
}

// Helper functions
function getCardValue(value) {
    const valueMap = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    return valueMap[value] || parseInt(value);
}

function isRoyalFlush(values, suits) {
    if (!checkFlush(suits) || !checkStraight(values)) {
        return false;
    }
    
    const royalValues = [10, 11, 12, 13, 14];
    const hasAllRoyalValues = royalValues.every(value => values.includes(value));
    
    if (!hasAllRoyalValues) return false;
    
    const royalCards = [];
    for (let i = 0; i < values.length; i++) {
        if (royalValues.includes(values[i])) {
            royalCards.push(suits[i]);
        }
    }
    
    return royalCards.length === 5 && royalCards.every(suit => suit === royalCards[0]);
}

function checkFlush(suits) {
    const suitCounts = {};
    suits.forEach(suit => suitCounts[suit] = (suitCounts[suit] || 0) + 1);
    return Object.values(suitCounts).some(count => count >= 5);
}

function checkStraight(values) {
    const sortedValues = [...new Set(values)].sort((a, b) => a - b);
    
    // Check for regular straight (excluding wheel)
    for (let i = 0; i <= sortedValues.length - 5; i++) {
        if (sortedValues[i + 4] - sortedValues[i] === 4) {
            return true;
        }
    }
    
    // Check for wheel (A-2-3-4-5) - Ace can only be used as low card
    if (sortedValues.includes(14)) {
        const lowValues = sortedValues.filter(v => v <= 5 || v === 14);
        if (lowValues.length >= 5) {
            const lowStraight = [2, 3, 4, 5, 14];
            if (lowStraight.every(v => lowValues.includes(v))) {
                return true;
            }
        }
        
        // Check for high straight (A-K-Q-J-10) - Ace can only be used as high card
        const highValues = sortedValues.filter(v => v >= 10 || v === 14);
        if (highValues.length >= 5) {
            const highStraight = [10, 11, 12, 13, 14];
            if (highStraight.every(v => highValues.includes(v))) {
                return true;
            }
        }
    }
    
    return false;
}

function hasFourOfAKind(valueCounts) {
    return Object.values(valueCounts).some(count => count === 4);
}

function hasFullHouse(valueCounts) {
    const counts = Object.values(valueCounts);
    return counts.includes(3) && counts.includes(2);
}

function hasThreeOfAKind(valueCounts) {
    return Object.values(valueCounts).some(count => count === 3);
}

function hasTwoPair(valueCounts) {
    const pairs = Object.values(valueCounts).filter(count => count === 2);
    return pairs.length >= 2;
}

function hasOnePair(valueCounts) {
    return Object.values(valueCounts).some(count => count === 2);
}

function getStraightHigh(values) {
    const sortedValues = [...new Set(values)].sort((a, b) => a - b);
    
    // Check for regular straight
    for (let i = 0; i <= sortedValues.length - 5; i++) {
        if (sortedValues[i + 4] - sortedValues[i] === 4) {
            return sortedValues[i + 4];
        }
    }
    
    // Check for wheel (A-2-3-4-5)
    if (sortedValues.includes(14)) {
        const lowValues = sortedValues.filter(v => v <= 5 || v === 14);
        if (lowValues.length >= 5) {
            const lowStraight = [2, 3, 4, 5, 14];
            if (lowStraight.every(v => lowValues.includes(v))) {
                return 5; // 5 is the high card in wheel
            }
        }
        
        // Check for high straight (A-K-Q-J-10)
        const highValues = sortedValues.filter(v => v >= 10 || v === 14);
        if (highValues.length >= 5) {
            const highStraight = [10, 11, 12, 13, 14];
            if (highStraight.every(v => highValues.includes(v))) {
                return 14; // Ace is the high card
            }
        }
    }
    
    return 0;
}

function getFourOfAKindValue(valueCounts) {
    for (const [value, count] of Object.entries(valueCounts)) {
        if (count === 4) return parseInt(value);
    }
    return 0;
}

function getThreeOfAKindValue(valueCounts) {
    for (const [value, count] of Object.entries(valueCounts)) {
        if (count === 3) return parseInt(value);
    }
    return 0;
}

function getThreeOfAKindValues(valueCounts) {
    const threeValues = [];
    for (const [value, count] of Object.entries(valueCounts)) {
        if (count === 3) {
            threeValues.push(parseInt(value));
        }
    }
    return threeValues.sort((a, b) => b - a);
}

function getPairValue(valueCounts, excludeValue = null) {
    const pairs = [];
    for (const [value, count] of Object.entries(valueCounts)) {
        if (count === 2 && parseInt(value) !== excludeValue) {
            pairs.push(parseInt(value));
        }
    }
    return pairs.length > 0 ? Math.max(...pairs) : 0;
}

function getPairValues(valueCounts, excludeValue = null) {
    const pairs = [];
    for (const [value, count] of Object.entries(valueCounts)) {
        if (count === 2 && parseInt(value) !== excludeValue) {
            pairs.push(parseInt(value));
        }
    }
    return pairs.sort((a, b) => b - a);
}

function getTwoPairValues(valueCounts) {
    const pairs = [];
    for (const [value, count] of Object.entries(valueCounts)) {
        if (count === 2) {
            pairs.push(parseInt(value));
        }
    }
    return pairs.sort((a, b) => b - a).slice(0, 2);
}

function getFlushValues(values, suits) {
    const suitCounts = {};
    suits.forEach(suit => suitCounts[suit] = (suitCounts[suit] || 0) + 1);
    
    const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5);
    if (!flushSuit) return [];
    
    const flushCards = [];
    for (let i = 0; i < values.length; i++) {
        if (suits[i] === flushSuit) {
            flushCards.push(values[i]);
        }
    }
    
    return flushCards.sort((a, b) => b - a).slice(0, 5);
}

function getHandDisplayName(handName) {
    const nameMap = {
        'Straight Flush': 'Straight flush',
        'Four of a Kind': 'Four-of-a-Kind',
        'Full House': 'Full house',
        'Flush': 'Flush',
        'Straight': 'Straight',
        'Three of a Kind': 'Three-of-a-Kind',
        'Two Pair': 'Two pair',
        'One Pair': 'One pair',
        'High Card': 'High card'
    };
    return nameMap[handName] || handName;
} 