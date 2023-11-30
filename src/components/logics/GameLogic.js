/**==============================================
 *        TURN BASED SOWING LOGIC
 * =============================================*/
export const turnBasedSowing = async (index, player, isContinuation, passedHouse, {
    seeds, setSeeds,
    setGamePhase, currentTurn, setCurrentTurn,
    setIsSowingUpper, setIsSowingLower,
    currentSeedsInHandUpper, setCurrentSeedsInHandUpper,
    setCurrentSeedsInHandLower,
    setTopHouseSeeds, setLowHouseSeeds,
    setCurrentHoleIndexUpper, setCurrentHoleIndexLower,
    toggleTurn, setShakeCursor, handleWrongSelection, 
    updateCursorPositionUpper, updateCursorPositionLower,
    HOLE_NUMBERS, PLAYER_UPPER, MAX_INDEX_UPPER, 
    MIN_INDEX_LOWER, MAX_INDEX_LOWER, TURN_BASED_SELECT,
    holeRefs, topHouseRef, lowHouseRef,
    startIndexUpper, startIndexLower,
    verticalPosUpper, verticalPosLower,
    setShowSelectionMessage
  }) => {
    // Determine player-specific states and actions
    const isUpperPlayer = player === PLAYER_UPPER;
    const currentHouseRef = isUpperPlayer ? topHouseRef : lowHouseRef;
    const setIsSowing = isUpperPlayer ? setIsSowingUpper : setIsSowingLower;
    const setHouseSeeds = isUpperPlayer ? setTopHouseSeeds : setLowHouseSeeds;
    const setCurrentSeedsInHand = isUpperPlayer ? setCurrentSeedsInHandUpper : setCurrentSeedsInHandLower;
    const setCurrentHoleIndex = isUpperPlayer ? setCurrentHoleIndexUpper : setCurrentHoleIndexLower;
    const verticalAdjustment = isUpperPlayer ? -0.5 : 0.5;
    const maxIndex = isUpperPlayer ? MAX_INDEX_UPPER : MAX_INDEX_LOWER;
    const minIndex = isUpperPlayer ? MIN_INDEX_LOWER : 0;
    
    // Start sowing
    setIsSowing(true);
    
    let currentIndex = index;
    let newSeeds = [...seeds];
    let seedsInHand = isContinuation ? (isUpperPlayer ? currentSeedsInHandUpper : newSeeds[index]) : newSeeds[index];
    // let seedsInHand = newSeeds[index];
    let hasPassedHouse = passedHouse;
    let justFilledHome = false;
    let getAnotherTurn = false;
    
    if (!isContinuation) {
      // Prevent picking from empty hole
      if (seedsInHand === 0) {
        console.log("Cannot pick empty hole. Pick again.");
        handleWrongSelection(setShakeCursor, setShowSelectionMessage);
        setGamePhase(TURN_BASED_SELECT);
        getAnotherTurn = true;
        setIsSowing(false);
        return;
      }
    }
    setCurrentSeedsInHand(seedsInHand);
    newSeeds[index] = 0;
    setSeeds([...newSeeds]);
    
    // Pick up animation
    if (isUpperPlayer) {
      await updateCursorPositionUpper(holeRefs, currentIndex, 0);
    } else {
      await updateCursorPositionLower(holeRefs, currentIndex, 0);
    }
    console.log("Starting turn based sowing")
    console.log("Seeds in hands: ", seedsInHand);
    while (seedsInHand > 0) {
      /** ============================================
       *              Sowing to House
       * ===========================================*/
      if (currentIndex === maxIndex) {
        hasPassedHouse++;
        if (isUpperPlayer) {
          await updateCursorPositionUpper(currentHouseRef, currentHouseRef.current, -0.1);
        } else {
          await updateCursorPositionLower(currentHouseRef, currentHouseRef.current, 0.1);
        }
        setHouseSeeds(prevSeeds => prevSeeds + 1);
        seedsInHand--;
        setCurrentSeedsInHand(seedsInHand);
        if (seedsInHand > 0) {
          justFilledHome = true;
          currentIndex = minIndex;
        } else {
          getAnotherTurn = true;
          setIsSowing(false);

          // reset cursor position
          if (isUpperPlayer) {
            await updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
            setCurrentHoleIndex(startIndexUpper);
          } else {
            await updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
            setCurrentHoleIndex(startIndexLower);
          }
          continue;
        }
      }
    
      // Move to the next hole in a circular way
      if (justFilledHome) {
        justFilledHome = false;
      } else {
        currentIndex = (currentIndex + 1) % HOLE_NUMBERS;
      }

      if (isUpperPlayer) {
        await updateCursorPositionUpper(holeRefs, currentIndex, verticalAdjustment);
      } else {
        await updateCursorPositionLower(holeRefs, currentIndex, verticalAdjustment);
      }

      // Update holes
      newSeeds[currentIndex]++;
      setSeeds([...newSeeds]);

      // Update seeds in hand
      seedsInHand--;
      setCurrentSeedsInHand(seedsInHand);
    
      /** ============================================
       *  If landed on non-empty house, continue sowing
       * ===========================================*/
      if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Animation delay
        seedsInHand = newSeeds[currentIndex]; // Pick up all seeds from the current hole
        setCurrentSeedsInHand(seedsInHand);
        
        // Empty the current hole
        newSeeds[currentIndex] = 0;
        setSeeds([...newSeeds]);

        // Pick up animation
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, currentIndex, 0);
        } else {
          await updateCursorPositionLower(holeRefs, currentIndex, 0);
        }

      } 
    
       /** ============================================
       *               Capturing
       * ===========================================*/
      // If landed in empty hole, check for capture
      if (seedsInHand === 0 && newSeeds[currentIndex] === 1) {
        
        // Capture only if the player has passed their house at least once
        if (hasPassedHouse === 0) continue;
      
        // Determine if the row is the current player's side
        const isTopRowHole = currentIndex < MIN_INDEX_LOWER;
        const isCurrentTurnRow = (isUpperPlayer && isTopRowHole) || 
                                 (!isUpperPlayer && !isTopRowHole);
      
        // Skip if not
        if (!isCurrentTurnRow) continue;
        
        // Calculate the opposite index
        const oppositeIndex = MAX_INDEX_LOWER - currentIndex;
        
        // Check if the opposite hole has seeds
        if (newSeeds[oppositeIndex] === 0) continue;
         
        // Pick up current hole animation
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, currentIndex, 0);
        } else {
          await updateCursorPositionLower(holeRefs, currentIndex, 0);
        }
        seedsInHand = newSeeds[currentIndex];
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[currentIndex] = 0;
        setSeeds([...newSeeds]);
      
        // Capturing ... (picking up from opposite hole)
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, oppositeIndex, verticalAdjustment);
        } else {
          await updateCursorPositionLower(holeRefs, oppositeIndex, verticalAdjustment);
        }
        const capturedSeeds = newSeeds[oppositeIndex] + seedsInHand;
        seedsInHand = capturedSeeds;
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[oppositeIndex] = 0;
        setSeeds([...newSeeds]);
        
        await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay
        // Send captured seeds to House
        // Animate cursor to the appropriate house and add captured seeds
        if (isUpperPlayer) {
          await updateCursorPositionUpper(currentHouseRef, currentHouseRef.current, -0.1);
        } else {
          await updateCursorPositionLower(currentHouseRef, currentHouseRef.current, 0.1);
        }
        setHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);

        // reset cursor position
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
        } else {
          await updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
        }
      
        // Update the state with the new distribution of seeds
        seedsInHand = 0;
        setCurrentSeedsInHand(seedsInHand);
      }
    }
    // End of sowing
    if (!getAnotherTurn) {
      toggleTurn(setCurrentTurn, currentTurn);
    }
    setIsSowing(false);
    setGamePhase(TURN_BASED_SELECT);
  };