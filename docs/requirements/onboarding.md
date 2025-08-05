When a user logs into the application, the onboarding_complete flag in the DB should be checked. If the flag is FALSE, they will be taken to the onboarding process. If the flag is TRUE, they will be taken to their dashboard.

Onboarding: Consists of three inter-navigable screens.
- Ingredients: This screen will display the customized top navigation bar we already designed for the Registration or Login screen. It has a text that says "You must enter at least three ingredients to continue. We assume you already have: water, salt, and sugar."

At the bottom, you will find the button panel containing the "Enter an ingredient" and "Continue" buttons. Tapping the "Enter an ingredient" button will open a pop-up window with the "Ingredient," "Quantity," and a list of unit selectors. When an ingredient is successfully added, it will also be written to the database and will appear as a card on the screen with an edit button and a delete button. Tapping the edit button will open a pop-up window pre-populated with the entered data for editing. A successful edit will also edit the database. Tapping the delete button will display a pop-up window confirming the deletion. A successful deletion will also delete the ingredient from the database.
By default, the continue button will be disabled and will be enabled when the user has entered three ingredients.

- Utensils: This screen will display the customized top navigation bar we outlined in the Registration or Login screen. It has a text that says "You must enter at least one utensil to continue. We assume you already have: spoon, fork, knife, and plates."

At the bottom, you will find the button panel containing the "Enter a Utensil" and "Continue" buttons. Tapping the "Enter a Utensil" button will open a pop-up window with the "Utensil" field. When a utensil is successfully added, it will also be written to the database and will appear as a card on the screen with an edit button and a delete button. Tapping the edit button will open a pop-up window pre-filled with the entered data so you can edit it. A successful edit will also edit the database. Tapping the delete button will display a pop-up window confirming the deletion. A successful deletion will also delete it from the database.
By default, the "Continue" button will be disabled and will be enabled when the user has entered one utensil.

- Tastes:
We will add a list of pill-type buttons for diets where the user can add a custom one, a list of pill-type buttons for tastes where the user can add a custom one, for difficulty it will be a list-type field selector, for time it will be a list-type field selector, and for portions it will be a list-type field selector. Everything must be user-friendly and self-explanatory.
At the bottom, there will be a "continue" button that will be disabled until everything is filled out.

When a user has not completed onboarding but already has items saved in the database, they must bring over what they already have in the database.

When onboarding is complete, a debug screen will be displayed where you will bring over all the data we have saved for the user and set the "onboarding complete" flag to true. When logging in a user with the "true" flag, this debug screen will be displayed.
