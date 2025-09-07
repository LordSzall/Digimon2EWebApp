# Dr. Digitama's Character Sheet Manager (2nd Edition)
*Current version: Beta 1.2.2*

## UPDATED FEATURES:
- **Qualities Section UI**: Qualities can now be added separately, with their descriptions accessible upon tapping. 
- **Create/Edit Qualities**: Added framework for creating/adding Qualities.
- **DP Allocation Update**: Quality DP is now tracked via the Qualities section, totalling each Qualities' DP.
- **Special Orders Section**: Tamers can now view their Special Orders separately from Tamer Talents.
- **Automatic Order-Handling**: Special Orders are added automatically, appearing as soon as the Tamer's Attribute is increased.
- **Button Styling Updated**: Some button designs have been updated.

*Patch Notes: Beta 1.2.1*

## UPDATED FEATURES:
- **Health Bar Fix**: All Health Bars for Wound Boxes initialize when a sheet is created.
- **Export/Import**: Sheet Data can now be exported/imported as .json files.
- **Empty Tab Buttons**: When no tabs are loaded, buttons will appear for you to create a new Digimon/Tamer sheet.
- **Updated Prompts**: New prompt windows for saving and error handling.

A web-based character sheet application for the **Digimon Digital Adventures 2nd Edition** tabletop roleplaying game.  
This tool allows players to create and manage **Tamer** and **Digimon** sheets in a modern, digital style.

## Features
- **Tabbed Sheets**: Open multiple Digimon or Tamer sheets in one session.
- **Digimon Sheet Layout**:
  - **Basic Info**: Name, Digimon, Type, Attribute, Stage, and Size.
  - **Combat Section**: Wound Boxes, Temp Wounds, Battery.
  - **Stats Section**: ACC, DOD, DAM, ARM, HP with DP and Bonus allocations.
  - **Derived Stats**: BIT, RAM, DOS, CPU based on size and core stats.
  - **Attacks Section**: Add custom attacks, including Signature Move.
  - **DP Allocation**: Tracks DP spent on Stats and Qualities.
  - **Qualities Section**: Add custom traits and notes.
- **Tamer Sheet Layout**:
  - **Tamer Info**: Name, Size and Age.
  - **Combat Section**: Wound Boxes, Speed, Inspiration.
  - **Milestone Tracking**: Track all Bonus DP for your Digimon Partner's Stages.
  - **Attributes Section**: AGI, BOD, CHA, INT and WIS stats with DP tracking.
  - **Skills Section**: Tab-based Skill Tracking based on Attribute.
  - **Ascpects Section**: Add your Tamer's Major/Minor Aspect.
  - **Torments Section**: Track your Tamer's Torment Boxes.
  - **Talents Section**: Add custom traits and notes.
- **Dynamic Calculations** for totals and derived values.
- **Health Bar UI**: Added for dynamic tracking of Wound Boxes.
- **Modern Digital UI Theme**.

## Planned Features
- **Export & Import** sheets to/from local storage.
- Export to PDF.
- Talent/Quality Libraries.
- Improved Mobile UI Handling.
- Improved Attack Section Handling
- Active Effects Handling

## How to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/digimon-2e-character-sheet.git
2. Open the Index.html in your browser app.
3. Import any Tamer/Digimon Sheets from your browser's data. (Optional)
