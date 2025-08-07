"use client"

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SpadeIcon as Spades, Calculator, RotateCcw, Shuffle, Play, Users, TrendingUp, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react'

// Types
interface PokerCard {
  value: string
  suit: string
}

interface Player {
  id: number
  name: string
  cards: [PokerCard | null, PokerCard | null]
  active: boolean
}

interface HandResult {
  rank: number
  name: string
  kickers: number[]
}

interface CalculationResult {
  player: Player
  wins: number
  ties: number
  total: number
  winPercentage: number
  tiePercentage: number
  handStats: Record<string, number>
}

// Constants
const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const CARD_SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
}
const SUIT_COLORS = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-800',
  spades: 'text-gray-800'
}

const HAND_RANKINGS = [
  'High Card',
  'One Pair', 
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
  'Royal Flush'
]

export default function PokerCalculator() {
  // State
  const [playerCount, setPlayerCount] = useState(2)
  const [players, setPlayers] = useState<Player[]>([])
  const [communityCards, setCommunityCards] = useState<(PokerCard | null)[]>([null, null, null, null, null])
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState(0)
  const [results, setResults] = useState<CalculationResult[]>([])
  const [calculationTime, setCalculationTime] = useState(0)
  const [showCardPicker, setShowCardPicker] = useState(false)
  const [cardPickerTarget, setCardPickerTarget] = useState<{type: 'player' | 'community', index: number, cardIndex?: number} | null>(null)
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null)

  // Initialize players when count changes
  useState(() => {
    const newPlayers: Player[] = []
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: i,
        name: `Player ${i + 1}`,
        cards: [null, null],
        active: true
      })
    }
    setPlayers(newPlayers)
  }, [playerCount])

  // Helper functions
  const showAlert = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }, [])

  const cardToString = useCallback((card: PokerCard): string => {
    return `${card.value}${card.suit[0]}`
  }, [])

  const isCardUsed = useCallback((card: PokerCard): boolean => {
    const cardStr = cardToString(card)
    return selectedCards.has(cardStr)
  }, [selectedCards, cardToString])

  const getCardValue = useCallback((value: string): number => {
    if (value === 'A') return 14
    if (value === 'K') return 13
    if (value === 'Q') return 12
    if (value === 'J') return 11
    return parseInt(value)
  }, [])

  // Card management
  const addCardToSelected = useCallback((card: PokerCard) => {
    const cardStr = cardToString(card)
    setSelectedCards(prev => new Set([...prev, cardStr]))
  }, [cardToString])

  const removeCardFromSelected = useCallback((card: PokerCard) => {
    const cardStr = cardToString(card)
    setSelectedCards(prev => {
      const newSet = new Set(prev)
      newSet.delete(cardStr)
      return newSet
    })
  }, [cardToString])

  const setPlayerCard = useCallback((playerIndex: number, cardIndex: number, card: PokerCard | null) => {
    setPlayers(prev => prev.map((player, idx) => {
      if (idx === playerIndex) {
        const newCards: [PokerCard | null, PokerCard | null] = [...player.cards]
        
        // Remove old card from selected if exists
        if (newCards[cardIndex]) {
          removeCardFromSelected(newCards[cardIndex]!)
        }
        
        newCards[cardIndex] = card
        
        // Add new card to selected if exists
        if (card) {
          addCardToSelected(card)
        }
        
        return { ...player, cards: newCards }
      }
      return player
    }))
  }, [addCardToSelected, removeCardFromSelected])

  const setCommunityCard = useCallback((index: number, card: PokerCard | null) => {
    setCommunityCards(prev => {
      const newCards = [...prev]
      
      // Remove old card from selected if exists
      if (newCards[index]) {
        removeCardFromSelected(newCards[index]!)
      }
      
      newCards[index] = card
      
      // Add new card to selected if exists
      if (card) {
        addCardToSelected(card)
      }
      
      return newCards
    })
  }, [addCardToSelected, removeCardFromSelected])

  const togglePlayer = useCallback((playerIndex: number) => {
    setPlayers(prev => prev.map((player, idx) => {
      if (idx === playerIndex) {
        const newActive = !player.active
        
        // If deactivating, remove cards
        if (!newActive) {
          if (player.cards[0]) removeCardFromSelected(player.cards[0])
          if (player.cards[1]) removeCardFromSelected(player.cards[1])
          return { ...player, active: false, cards: [null, null] }
        }
        
        return { ...player, active: newActive }
      }
      return player
    }))
  }, [removeCardFromSelected])

  // Card picker
  const openCardPicker = useCallback((type: 'player' | 'community', index: number, cardIndex?: number) => {
    if (type === 'player' && !players[index]?.active) {
      showAlert('error', 'Player is not active! Activate them first.')
      return
    }
    
    setCardPickerTarget({ type, index, cardIndex })
    setShowCardPicker(true)
  }, [players, showAlert])

  const selectCard = useCallback((card: PokerCard) => {
    if (!cardPickerTarget) return
    
    if (isCardUsed(card)) {
      showAlert('error', 'This card is already in use!')
      return
    }

    if (cardPickerTarget.type === 'player') {
      setPlayerCard(cardPickerTarget.index, cardPickerTarget.cardIndex!, card)
    } else {
      setCommunityCard(cardPickerTarget.index, card)
    }

    setShowCardPicker(false)
    setCardPickerTarget(null)
    showAlert('success', 'Card assigned successfully!')
  }, [cardPickerTarget, isCardUsed, setPlayerCard, setCommunityCard, showAlert])

  // Random card generation
  const getRandomCard = useCallback((): PokerCard => {
    let attempts = 0
    while (attempts < 1000) {
      const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)]
      const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)]
      const card = { value, suit }
      
      if (!isCardUsed(card)) {
        return card
      }
      attempts++
    }
    throw new Error('Unable to find available card')
  }, [isCardUsed])

  const generateRandomCards = useCallback(() => {
    try {
      // Clear all cards first
      setSelectedCards(new Set())
      
      const newPlayers = [...players]
      const newCommunityCards: (PokerCard | null)[] = [null, null, null, null, null]
      const usedCards = new Set<string>()

      // Generate player cards
      for (let i = 0; i < newPlayers.length; i++) {
        if (newPlayers[i].active) {
          for (let j = 0; j < 2; j++) {
            let card: PokerCard
            let attempts = 0
            do {
              if (attempts > 1000) throw new Error('Unable to generate unique cards')
              const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)]
              const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)]
              card = { value, suit }
              attempts++
            } while (usedCards.has(cardToString(card)))
            
            newPlayers[i].cards[j] = card
            usedCards.add(cardToString(card))
          }
        } else {
          newPlayers[i].cards = [null, null]
        }
      }

      // Generate community cards
      for (let i = 0; i < 5; i++) {
        let card: PokerCard
        let attempts = 0
        do {
          if (attempts > 1000) throw new Error('Unable to generate unique cards')
          const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)]
          const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)]
          card = { value, suit }
          attempts++
        } while (usedCards.has(cardToString(card)))
        
        newCommunityCards[i] = card
        usedCards.add(cardToString(card))
      }

      setPlayers(newPlayers)
      setCommunityCards(newCommunityCards)
      setSelectedCards(usedCards)
      showAlert('success', 'Random cards generated successfully!')
    } catch (error) {
      showAlert('error', 'Failed to generate random cards')
    }
  }, [players, cardToString, showAlert])

  const generateRandomFlop = useCallback(() => {
    try {
      const newCommunityCards = [...communityCards]
      const usedCards = new Set(selectedCards)

      for (let i = 0; i < 3; i++) {
        if (newCommunityCards[i]) {
          usedCards.delete(cardToString(newCommunityCards[i]!))
        }
        
        let card: PokerCard
        let attempts = 0
        do {
          if (attempts > 1000) throw new Error('Unable to generate unique card')
          const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)]
          const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)]
          card = { value, suit }
          attempts++
        } while (usedCards.has(cardToString(card)))
        
        newCommunityCards[i] = card
        usedCards.add(cardToString(card))
      }

      setCommunityCards(newCommunityCards)
      setSelectedCards(usedCards)
      showAlert('success', 'Random flop generated!')
    } catch (error) {
      showAlert('error', 'Failed to generate random flop')
    }
  }, [communityCards, selectedCards, cardToString, showAlert])

  const generateRandomTurn = useCallback(() => {
    if (!communityCards[0] || !communityCards[1] || !communityCards[2]) {
      showAlert('error', 'Generate flop first!')
      return
    }

    try {
      const newCommunityCards = [...communityCards]
      const usedCards = new Set(selectedCards)

      if (newCommunityCards[3]) {
        usedCards.delete(cardToString(newCommunityCards[3]!))
      }
      
      let card: PokerCard
      let attempts = 0
      do {
        if (attempts > 1000) throw new Error('Unable to generate unique card')
        const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)]
        const suit = CARD_SUITS[Math.floor(Math.random() * CARD_VALUES.length)]
        card = { value, suit }
        attempts++
      } while (usedCards.has(cardToString(card)))
      
      newCommunityCards[3] = card
      usedCards.add(cardToString(card))

      setCommunityCards(newCommunityCards)
      setSelectedCards(usedCards)
      showAlert('success', 'Random turn generated!')
    } catch (error) {
      showAlert('error', 'Failed to generate random turn')
    }
  }, [communityCards, selectedCards, cardToString, showAlert])

  const generateRandomRiver = useCallback(() => {
    if (!communityCards[3]) {
      showAlert('error', 'Generate turn first!')
      return
    }

    try {
      const newCommunityCards = [...communityCards]
      const usedCards = new Set(selectedCards)

      if (newCommunityCards[4]) {
        usedCards.delete(cardToString(newCommunityCards[4]!))
      }
      
      let card: PokerCard
      let attempts = 0
      do {
        if (attempts > 1000) throw new Error('Unable to generate unique card')
        const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)]
        const suit = CARD_SUITS[Math.floor(Math.random() * CARD_VALUES.length)]
        card = { value, suit }
        attempts++
      } while (usedCards.has(cardToString(card)))
      
      newCommunityCards[4] = card
      usedCards.add(cardToString(card))

      setCommunityCards(newCommunityCards)
      setSelectedCards(usedCards)
      showAlert('success', 'Random river generated!')
    } catch (error) {
      showAlert('error', 'Failed to generate random river')
    }
  }, [communityCards, selectedCards, cardToString, showAlert])

  const clearBoard = useCallback(() => {
    const hasCards = communityCards.some(card => card !== null)
    if (!hasCards) {
      showAlert('warning', 'Board is already empty!')
      return
    }

    // Remove community cards from selected
    communityCards.forEach(card => {
      if (card) removeCardFromSelected(card)
    })

    setCommunityCards([null, null, null, null, null])
    showAlert('success', 'Board cleared!')
  }, [communityCards, removeCardFromSelected, showAlert])

  const resetAll = useCallback(() => {
    setSelectedCards(new Set())
    setPlayers(prev => prev.map(player => ({
      ...player,
      cards: [null, null] as [PokerCard | null, PokerCard | null],
      active: true
    })))
    setCommunityCards([null, null, null, null, null])
    setResults([])
    showAlert('success', 'Everything reset!')
  }, [showAlert])

  // Hand evaluation functions
  const evaluateHand = useCallback((cards: PokerCard[]): HandResult => {
    if (cards.length !== 7) {
      throw new Error('Hand evaluation requires exactly 7 cards')
    }

    const values = cards.map(card => getCardValue(card.value))
    const suits = cards.map(card => card.suit)
    
    // Count value frequencies
    const valueCounts: Record<number, number> = {}
    values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1)
    
    // Get sorted values for kicker comparison
    const sortedValues = [...values].sort((a, b) => b - a)
    
    // Check for flush
    const suitCounts: Record<string, number> = {}
    suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1)
    const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5)
    
    // Check for straight
    const uniqueValues = [...new Set(values)].sort((a, b) => a - b)
    let straightHigh = 0
    
    // Check for regular straight
    for (let i = 0; i <= uniqueValues.length - 5; i++) {
      if (uniqueValues[i + 4] - uniqueValues[i] === 4) {
        straightHigh = uniqueValues[i + 4]
        break
      }
    }
    
    // Check for wheel (A-2-3-4-5)
    if (!straightHigh && uniqueValues.includes(14)) {
      const wheelValues = [2, 3, 4, 5, 14]
      if (wheelValues.every(v => uniqueValues.includes(v))) {
        straightHigh = 5 // 5 is high in wheel
      }
    }
    
    const isFlush = !!flushSuit
    const isStraight = straightHigh > 0
    
    // Check for royal flush
    if (isFlush && isStraight) {
      const flushCards = cards.filter(card => card.suit === flushSuit)
      const flushValues = flushCards.map(card => getCardValue(card.value))
      const royalValues = [10, 11, 12, 13, 14]
      
      if (royalValues.every(v => flushValues.includes(v))) {
        return { rank: 9, name: 'Royal Flush', kickers: [14] }
      }
      
      // Check if straight flush
      const flushUniqueValues = [...new Set(flushValues)].sort((a, b) => a - b)
      let flushStraightHigh = 0
      
      for (let i = 0; i <= flushUniqueValues.length - 5; i++) {
        if (flushUniqueValues[i + 4] - flushUniqueValues[i] === 4) {
          flushStraightHigh = flushUniqueValues[i + 4]
          break
        }
      }
      
      if (!flushStraightHigh && flushUniqueValues.includes(14)) {
        const wheelValues = [2, 3, 4, 5, 14]
        if (wheelValues.every(v => flushUniqueValues.includes(v))) {
          flushStraightHigh = 5
        }
      }
      
      if (flushStraightHigh > 0) {
        return { rank: 8, name: 'Straight Flush', kickers: [flushStraightHigh] }
      }
    }
    
    // Check for four of a kind
    const fourValue = Object.keys(valueCounts).find(v => valueCounts[parseInt(v)] === 4)
    if (fourValue) {
      const kicker = sortedValues.find(v => v !== parseInt(fourValue)) || 0
      return { rank: 7, name: 'Four of a Kind', kickers: [parseInt(fourValue), kicker] }
    }
    
    // Check for full house
    const threeValues = Object.keys(valueCounts).filter(v => valueCounts[parseInt(v)] === 3).map(v => parseInt(v))
    const pairValues = Object.keys(valueCounts).filter(v => valueCounts[parseInt(v)] === 2).map(v => parseInt(v))
    
    if (threeValues.length > 0 && (pairValues.length > 0 || threeValues.length > 1)) {
      const bestThree = Math.max(...threeValues)
      const bestPair = threeValues.length > 1 
        ? Math.max(...threeValues.filter(v => v !== bestThree))
        : Math.max(...pairValues)
      return { rank: 6, name: 'Full House', kickers: [bestThree, bestPair] }
    }
    
    // Check for flush
    if (isFlush) {
      const flushCards = cards.filter(card => card.suit === flushSuit)
      const flushValues = flushCards.map(card => getCardValue(card.value)).sort((a, b) => b - a).slice(0, 5)
      return { rank: 5, name: 'Flush', kickers: flushValues }
    }
    
    // Check for straight
    if (isStraight) {
      return { rank: 4, name: 'Straight', kickers: [straightHigh] }
    }
    
    // Check for three of a kind
    if (threeValues.length > 0) {
      const threeValue = Math.max(...threeValues)
      const kickers = sortedValues.filter(v => v !== threeValue).slice(0, 2)
      return { rank: 3, name: 'Three of a Kind', kickers: [threeValue, ...kickers] }
    }
    
    // Check for two pair
    if (pairValues.length >= 2) {
      const sortedPairs = pairValues.sort((a, b) => b - a).slice(0, 2)
      const kicker = sortedValues.find(v => !sortedPairs.includes(v)) || 0
      return { rank: 2, name: 'Two Pair', kickers: [...sortedPairs, kicker] }
    }
    
    // Check for one pair
    if (pairValues.length > 0) {
      const pairValue = Math.max(...pairValues)
      const kickers = sortedValues.filter(v => v !== pairValue).slice(0, 3)
      return { rank: 1, name: 'One Pair', kickers: [pairValue, ...kickers] }
    }
    
    // High card
    return { rank: 0, name: 'High Card', kickers: sortedValues.slice(0, 5) }
  }, [getCardValue])

  const compareHands = useCallback((hand1: HandResult, hand2: HandResult): number => {
    if (hand1.rank !== hand2.rank) {
      return hand1.rank - hand2.rank
    }
    
    // Compare kickers
    for (let i = 0; i < Math.max(hand1.kickers.length, hand2.kickers.length); i++) {
      const kicker1 = hand1.kickers[i] || 0
      const kicker2 = hand2.kickers[i] || 0
      if (kicker1 !== kicker2) {
        return kicker1 - kicker2
      }
    }
    
    return 0 // Tie
  }, [])

  // Calculation
  const calculateProbabilities = useCallback(async () => {
    const activePlayers = players.filter(p => p.active && p.cards[0] && p.cards[1])
    
    if (activePlayers.length < 2) {
      showAlert('error', 'Need at least 2 active players with cards!')
      return
    }
    
    const boardCards = communityCards.filter(card => card !== null) as PokerCard[]
    if (boardCards.length < 3) {
      showAlert('error', 'Need at least flop (3 cards) on board!')
      return
    }

    setIsCalculating(true)
    setCalculationProgress(0)
    const startTime = Date.now()

    try {
      // Create deck without used cards
      const usedCardStrings = new Set<string>()
      activePlayers.forEach(player => {
        player.cards.forEach(card => {
          if (card) usedCardStrings.add(cardToString(card))
        })
      })
      boardCards.forEach(card => usedCardStrings.add(cardToString(card)))

      const availableDeck: PokerCard[] = []
      CARD_VALUES.forEach(value => {
        CARD_SUITS.forEach(suit => {
          const card = { value, suit }
          if (!usedCardStrings.has(cardToString(card))) {
            availableDeck.push(card)
          }
        })
      })

      const neededCards = 5 - boardCards.length
      
      // Generate all combinations of remaining cards
      const combinations: PokerCard[][] = []
      
      if (neededCards === 1) {
        availableDeck.forEach(card => combinations.push([card]))
      } else if (neededCards === 2) {
        for (let i = 0; i < availableDeck.length; i++) {
          for (let j = i + 1; j < availableDeck.length; j++) {
            combinations.push([availableDeck[i], availableDeck[j]])
          }
        }
      }

      // Initialize results
      const calculationResults: CalculationResult[] = activePlayers.map(player => ({
        player,
        wins: 0,
        ties: 0,
        total: 0,
        winPercentage: 0,
        tiePercentage: 0,
        handStats: Object.fromEntries(HAND_RANKINGS.map(rank => [rank, 0]))
      }))

      // Process each combination
      for (let i = 0; i < combinations.length; i++) {
        const combination = combinations[i]
        const completeBoard = [...boardCards, ...combination]
        
        // Evaluate each player's hand
        const playerHands = activePlayers.map((player, index) => {
          const allCards = [...player.cards.filter(c => c !== null) as PokerCard[], ...completeBoard]
          const hand = evaluateHand(allCards)
          calculationResults[index].handStats[hand.name]++
          return { player, hand, index }
        })

        // Find winner(s)
        let bestRank = -1
        let winners: number[] = []

        playerHands.forEach(({ hand, index }) => {
          if (hand.rank > bestRank) {
            bestRank = hand.rank
            winners = [index]
          } else if (hand.rank === bestRank) {
            // Compare kickers
            const comparison = compareHands(hand, playerHands[winners[0]].hand)
            if (comparison > 0) {
              winners = [index]
            } else if (comparison === 0) {
              winners.push(index)
            }
          }
        })

        // Update results
        if (winners.length === 1) {
          calculationResults[winners[0]].wins++
        } else {
          winners.forEach(winnerIndex => {
            calculationResults[winnerIndex].ties++
          })
        }

        calculationResults.forEach(result => result.total++)

        // Update progress
        if (i % Math.max(1, Math.floor(combinations.length / 100)) === 0) {
          setCalculationProgress((i / combinations.length) * 100)
          await new Promise(resolve => setTimeout(resolve, 0)) // Allow UI update
        }
      }

      // Calculate percentages
      calculationResults.forEach(result => {
        result.winPercentage = (result.wins / result.total) * 100
        result.tiePercentage = (result.ties / result.total) * 100
      })

      setResults(calculationResults)
      setCalculationTime(Date.now() - startTime)
      showAlert('success', 'Calculation completed!')

    } catch (error) {
      console.error('Calculation error:', error)
      showAlert('error', 'Calculation failed!')
    } finally {
      setIsCalculating(false)
      setCalculationProgress(0)
    }
  }, [players, communityCards, cardToString, evaluateHand, compareHands, showAlert])

  // Computed values
  const activePlayers = useMemo(() => 
    players.filter(p => p.active), 
    [players]
  )

  const activePlayersWithCards = useMemo(() => 
    players.filter(p => p.active && p.cards[0] && p.cards[1]), 
    [players]
  )

  const boardCardCount = useMemo(() => 
    communityCards.filter(card => card !== null).length, 
    [communityCards]
  )

  // Render card component
  const renderCard = useCallback((card: PokerCard | null, onClick?: () => void) => {
    if (!card) {
      return (
        <div 
          className="w-16 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          onClick={onClick}
        >
          <span className="text-2xl text-gray-400">+</span>
        </div>
      )
    }

    return (
      <div 
        className={`w-16 h-20 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:shadow-md transition-all ${SUIT_COLORS[card.suit as keyof typeof SUIT_COLORS]}`}
        onClick={onClick}
      >
        <div className="text-lg font-bold">{card.value}</div>
        <div className="text-xl">{SUIT_SYMBOLS[card.suit as keyof typeof SUIT_SYMBOLS]}</div>
      </div>
    )
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Spades className="h-8 w-8" />
              Poker Calculator
            </CardTitle>
            <CardDescription className="text-green-100 text-lg">
              Texas Hold'em Probability Calculator
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Alert */}
        {alert && (
          <Alert className={`${
            alert.type === 'error' ? 'border-red-500 bg-red-50' :
            alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
            'border-green-500 bg-green-50'
          }`}>
            {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Game Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2">
                <Label htmlFor="player-count">Number of Players</Label>
                <Select value={playerCount.toString()} onValueChange={(value) => setPlayerCount(parseInt(value))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} Players</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Complete enumeration for 100% accuracy</span>
              </div>

              <div className="flex gap-3 ml-auto">
                <Button onClick={calculateProbabilities} disabled={isCalculating} className="bg-green-600 hover:bg-green-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Odds
                </Button>
                <Button variant="outline" onClick={resetAll}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
                <Button variant="outline" onClick={generateRandomCards}>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Random Cards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players */}
        <Card>
          <CardHeader>
            <CardTitle>Players & Cards</CardTitle>
            <CardDescription>
              Active players: {activePlayers.length} | Players with cards: {activePlayersWithCards.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player, index) => (
                <div key={player.id} className={`p-4 border-2 rounded-lg transition-all ${
                  player.active ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{player.name}</h3>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={player.active}
                        onCheckedChange={() => togglePlayer(index)}
                      />
                      <Label className="text-sm">Active</Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {renderCard(player.cards[0], () => openCardPicker('player', index, 0))}
                    {renderCard(player.cards[1], () => openCardPicker('player', index, 1))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Community Cards (Board)</CardTitle>
            <CardDescription>
              Cards on board: {boardCardCount}/5
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 justify-center">
                {communityCards.map((card, index) => (
                  <div key={index} className="text-center">
                    {renderCard(card, () => openCardPicker('community', index))}
                    <div className="text-xs text-gray-500 mt-1">
                      {index < 3 ? `Flop ${index + 1}` : index === 3 ? 'Turn' : 'River'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 justify-center flex-wrap">
                <Button variant="outline" size="sm" onClick={generateRandomFlop}>
                  <Shuffle className="h-3 w-3 mr-1" />
                  Random Flop
                </Button>
                <Button variant="outline" size="sm" onClick={generateRandomTurn}>
                  <Shuffle className="h-3 w-3 mr-1" />
                  Random Turn
                </Button>
                <Button variant="outline" size="sm" onClick={generateRandomRiver}>
                  <Shuffle className="h-3 w-3 mr-1" />
                  Random River
                </Button>
                <Button variant="outline" size="sm" onClick={clearBoard}>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Clear Board
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculation Progress */}
        {isCalculating && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Calculating probabilities...</span>
                  <span className="text-sm text-gray-500">{Math.round(calculationProgress)}%</span>
                </div>
                <Progress value={calculationProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Calculation Results
              </CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Calculation time: {calculationTime}ms
                </span>
                <span>Total combinations: {results[0]?.total.toLocaleString()}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed Stats</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4">
                    {results.map((result, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{result.player.name}</h3>
                          <div className="flex gap-2">
                            {renderCard(result.player.cards[0])}
                            {renderCard(result.player.cards[1])}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {result.winPercentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">Win</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-yellow-600">
                              {result.tiePercentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">Tie</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-red-600">
                              {(100 - result.winPercentage - result.tiePercentage).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">Lose</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="detailed" className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">{result.player.name} - Hand Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        {HAND_RANKINGS.map(ranking => (
                          <div key={ranking} className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">{result.handStats[ranking]}</div>
                            <div className="text-xs text-gray-500">{ranking}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Card Picker Modal */}
        {showCardPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
              <CardHeader>
                <CardTitle>Select a Card</CardTitle>
                <CardDescription>
                  Choose a card for {cardPickerTarget?.type === 'player' 
                    ? `${players[cardPickerTarget.index]?.name} - Card ${(cardPickerTarget.cardIndex || 0) + 1}`
                    : `Community - ${cardPickerTarget?.index === 0 || cardPickerTarget?.index === 1 || cardPickerTarget?.index === 2 ? `Flop ${(cardPickerTarget?.index || 0) + 1}` : cardPickerTarget?.index === 3 ? 'Turn' : 'River'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Hearts Row */}
                  <div className="grid grid-cols-13 gap-2">
                    {CARD_VALUES.map(value => {
                      const card = { value, suit: 'hearts' }
                      const isUsed = isCardUsed(card)
                      return (
                        <button
                          key={`${value}-hearts`}
                          className={`aspect-[3/4] border-2 rounded-lg flex flex-col items-center justify-center text-sm font-bold transition-all ${
                            isUsed 
                              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'border-gray-300 bg-white hover:border-red-400 hover:shadow-md cursor-pointer text-red-500'
                          }`}
                          onClick={() => !isUsed && selectCard(card)}
                          disabled={isUsed}
                        >
                          <div className="text-base">{value}</div>
                          <div className="text-lg">♥</div>
                        </button>
                      )
                    })}
                  </div>
                  
                  {/* Diamonds Row */}
                  <div className="grid grid-cols-13 gap-2">
                    {CARD_VALUES.map(value => {
                      const card = { value, suit: 'diamonds' }
                      const isUsed = isCardUsed(card)
                      return (
                        <button
                          key={`${value}-diamonds`}
                          className={`aspect-[3/4] border-2 rounded-lg flex flex-col items-center justify-center text-sm font-bold transition-all ${
                            isUsed 
                              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'border-gray-300 bg-white hover:border-red-400 hover:shadow-md cursor-pointer text-red-500'
                          }`}
                          onClick={() => !isUsed && selectCard(card)}
                          disabled={isUsed}
                        >
                          <div className="text-base">{value}</div>
                          <div className="text-lg">♦</div>
                        </button>
                      )
                    })}
                  </div>
                  
                  {/* Clubs Row */}
                  <div className="grid grid-cols-13 gap-2">
                    {CARD_VALUES.map(value => {
                      const card = { value, suit: 'clubs' }
                      const isUsed = isCardUsed(card)
                      return (
                        <button
                          key={`${value}-clubs`}
                          className={`aspect-[3/4] border-2 rounded-lg flex flex-col items-center justify-center text-sm font-bold transition-all ${
                            isUsed 
                              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'border-gray-300 bg-white hover:border-gray-600 hover:shadow-md cursor-pointer text-gray-800'
                          }`}
                          onClick={() => !isUsed && selectCard(card)}
                          disabled={isUsed}
                        >
                          <div className="text-base">{value}</div>
                          <div className="text-lg">♣</div>
                        </button>
                      )
                    })}
                  </div>
                  
                  {/* Spades Row */}
                  <div className="grid grid-cols-13 gap-2">
                    {CARD_VALUES.map(value => {
                      const card = { value, suit: 'spades' }
                      const isUsed = isCardUsed(card)
                      return (
                        <button
                          key={`${value}-spades`}
                          className={`aspect-[3/4] border-2 rounded-lg flex flex-col items-center justify-center text-sm font-bold transition-all ${
                            isUsed 
                              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'border-gray-300 bg-white hover:border-gray-600 hover:shadow-md cursor-pointer text-gray-800'
                          }`}
                          onClick={() => !isUsed && selectCard(card)}
                          disabled={isUsed}
                        >
                          <div className="text-base">{value}</div>
                          <div className="text-lg">♠</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCardPicker(false)
                      setCardPickerTarget(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
