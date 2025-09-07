// special-orders.js - Special Orders System for DDA2E

window.SpecialOrders = {
    // Color mapping for attributes
    getAttributeColor(attribute) {
        const colors = {
            'AGI': '#00eaff',    // Cyan
            'BOD': '#ff3b6b',    // Red
            'CHA': '#fe6',       // Yellow
            'INT': '#00f59d',    // Green
            'WIL': '#9d4edd'     // Purple
        };
        return colors[attribute] || '#00eaff';
    },

    // Special Orders database
    specialOrdersData: {
        'AGI': {
            5: {
                name: "FULL SPEED AHEAD",
                type: "1/Round",
                level: 5,
                attribute: "AGI",
                description: "[2 ACTIONS] The Tamer helps their Digimon increase their momentum. The Digimon gains 1 extra Action, which must be used to take the Move or Difficult Move Action."
            },
            6: {
                name: "DON'T LEAVE ANY OPENINGS",
                type: "Passive",
                level: 6,
                attribute: "AGI",
                description: "The Tamer can inspire a burst of speed in your Digimon. Your Digimon gains 2 extra Actions, and is treated as if it was a different round for the purpose of bypassing rules (such as one Attack per Round). This means a Digimon can take both of its Actions, and by using this Special Order it gets a second turn in the same round."
            },
            7: {
                name: "FINISH IT NOW",
                type: "1/Rest",
                level: 7,
                attribute: "AGI",
                description: "[2 ACTIONS] The Tamer can inspire a burst of speed in your Digimon. Your Digimon gains 2 extra Actions, and is treated as if it was a different round for the purpose of bypassing rules (such as one Attack per Round). This means a Digimon can take both of its Actions, and by using this Special Order it gets a second turn in the same round."
            }
        },
        'BOD': {
            5: {
                name: "DON'T WORRY, YOU'LL HEAL",
                type: "Passive",
                level: 5,
                attribute: "BOD",
                description: "You gain +2 wound boxes permanently. Additionally, you recover from physical ailments (poison, disease, exhaustion) twice as fast as normal."
            },
            6: {
                name: "YOU CAN TAKE IT",
                type: "1/Combat",
                level: 6,
                attribute: "BOD",
                description: "[FREE INTERRUPT ACTION] When the Digimon is brought to 0 Wound Boxes, the Tamer makes a Pool Check using Body. The Digimon regains missing Wound Boxes equal to the number of successes + the Digimon’s Stage and isn’t Defeated, remaining at its current Stage."
            },
            7: {
                name: "I'M WITH YOU",
                type: "1/Rest",
                level: 7,
                attribute: "BOD",
                description: "[1 ACTION] The Tamer may declare this Special Order after its Digimon rolls Accuracy for an Attack. Any 4s that were rolled for this Attack now act as Successes towards their Digimon’s Accuracy Check. NOTE: This Special Order can be used as an Interrupt Action if the Attack is also made as an Interrupt Action (such as Counterattack)."
            }
        },
        'CHA': {
            5: {
                name: "HEY YOU",
                type: "UNLIMITED",
                level: 5,
                attribute: "CHA",
                description: "[1 ACTION] The Tamer and a willing ally Digimon work together to rattle up an enemy. [TAUNT] is now in effect for 3 rounds. [TAUNT]is applied to one Enemy, and the recipient (the willing Digimon) automatically receives aggro based on their CPU, as per normal [TAUNT] rules. This Special Order cannot be used again until [TAUNT] wears off or is removed."
            },
            6: {
                name: "I BELIEVE IN YOU",
                type: "1/Session",
                level: 6,
                attribute: "CHA",
                description: "The Tamer rallies a willing Ally Digimon. The Digimon gains the [BASTION 2] Effect from their Tamer, which lasts until the start of the Tamer’s next turn. NOTE: [BASTION] is a Positive Effect that grants a bonus equal to the Digimon's primary Stats (except Health) based on its value."
            },
            7: {
                name: "WAKE UP, DON'T QUIT NOW",
                type: "1/Rest",
                level: 7,
                attribute: "CHA",
                description: "[2 ACTIONS] This Order can only be Activated when your Digimon has 0 Wound Boxes or has dropped to its Default Stage after being Defeated. The Digimon returns to the Stage it was at when it was Defeated, and the Tamer must make a Charisma Check with a TN of 12 + the Digimon’s Stage. On a Critical Failure or Failure, the Digimon will revive with 1 Wound Box. On a Success, the Digimon revives with an amount of Wound Boxes equal to its Stage + 1. On a Critical Success, the Digimon will revive with half of their Wound Box Maximum regained or Stage +1 (whichever is higher)."
            }
        },
        'INT': {
            5: {
                name: "I'VE CALCULATED THE ODDS",
                type: "1/Round",
                level: 5,
                attribute: "INT",
                description: "When the Tamer or its Digimon would take the Bolster Action, instead of gaining +2 Dice to a Pool Check, you can choose to instead gain +1 Success on the result."
            },
            6: {
                name: "TIME FOR PLAN B",
                type: "1/Combat",
                level: 6,
                attribute: "INT",
                description: "[FREE ACTION] When the Tamer's Digimon would make an Attack, the Digimon can treat it as its Signature Move if it wasn’t already. This grants the Attack all the benefits of Signature Move and expends Battery like normal. After the Attack is made, the effects of this Special Order end and it becomes a regular Attack again."
            },
            7: {
                name: "I'VE FOUND AN EXPLOIT",
                type: "1/Session",
                level: 7,
                attribute: "INT",
                description: "The Tamer inflicts [DEBILITATE] on one Enemy Digimon with a Potency equal to its Stage until the start of the Tamer’s next turn. If multiple [DEBILITATE] debuffs are called, they do not stack with one another [DEBILITATE] is a Negative Effect that causes the Digimon to suffer a penalty to all stats except Health equal to its Potency."
            }
        },
        'WIL': {
            5: {
                name: "TOUGH IT OUT",
                type: "1/Round",
                level: 5,
                attribute: "WIL",
                description: "Out of sheer willpower, the Tamer’s Digimon is cured from one Negative Effect that was plaguing them as if they used [CLEANSE]."
            },
            6: {
                name: "NEVER BACK DOWN",
                type: "1/COMBAT",
                level: 6,
                attribute: "WIL",
                description: "When Initiative is rolled, the Tamer makes a Willpower Pool Check. Their Digimon gains Temporary Wound Boxes equal to the number of Successes + the highest stage among all enemies present (to a max of 5).  These Temporary Wound Boxes stack with other sources (and are always removed first in that scenario). These last until the end of Combat."
            },
            7: {
                name: "Miracle",
                type: "1/Session",
                level: 7,
                attribute: "WIL",
                description: "Through sheer force of willpower, the tamer gains total narrative control of a roll. By spending 7 IP the Tamer may add or subtract a bonus Willpower + 5 to a Skill Check, or Dodge or Accuracy Pool. Then they may set the results of each die rolled. If you want nothing but 6’s? That’s fine. 1’s all around? That’s your choice as a Player. You cannot use Temporary IP for this Tamer Talent."
            }
        }
    },

    // Get a specific special order
    getSpecialOrder(attribute, level) {
        if (!this.specialOrdersData[attribute]) return null;
        return this.specialOrdersData[attribute][level] || null;
    },

    // Get all special orders for an attribute
    getAttributeOrders(attribute) {
        const orders = this.specialOrdersData[attribute] || {};
        return Object.values(orders).sort((a, b) => a.level - b.level);
    },

    // Get all available special orders based on attribute levels
    getAvailableOrders(attributeLevels) {
        const availableOrders = [];

        Object.keys(attributeLevels).forEach(attr => {
            const level = attributeLevels[attr];
            for (let reqLevel = 5; reqLevel <= Math.min(level, 7); reqLevel++) {
                const order = this.getSpecialOrder(attr, reqLevel);
                if (order) {
                    availableOrders.push(order);
                }
            }
        });

        return availableOrders.sort((a, b) => {
            // Sort by attribute, then by level
            if (a.attribute !== b.attribute) {
                return a.attribute.localeCompare(b.attribute);
            }
            return a.level - b.level;
        });
    },

    // Validate that special orders are earned by current attribute levels
    validateOrders(attributeLevels, ownedOrders) {
        return ownedOrders.filter(orderId => {
            const [attr, level] = orderId.split('-');
            const requiredLevel = parseInt(level);
            const currentLevel = attributeLevels[attr] || 0;
            return currentLevel >= requiredLevel;
        });
    }
};
