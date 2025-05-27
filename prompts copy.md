Add a new tab that will provide a flash card like UI for learning Thai.  For each flash card:

    Display a word written in Thai from words.json.  Only show words that have been do not have an empty string for the english translation.

    Allow the learner to write the english translation of the word.


    The app will compare the users entry with the data from the words.json.

    If the translation is incorrect, the app will display the correct translation.

    If the entry is correct, the app will ask the user to pronounce the word by clicking a button.

    The app will test for the correctness of the users pronunciation of the word by sending the pronunciation to the google cloud speech to text api and then to translation api and comparing the result to the translation in words.json.

    If the pronunciation is correct, the app will display a message saying "Correct!" and display the next flash card.

    If the pronunciation is incorrect, the app will display a message saying "Incorrect!" and allow the user to try again.

    At any point the user can click a button to display the next flash card.  The app will also allow the user to click a button to go back to the previous flash card.

    The app will keep track of the number of correct and incorrect pronunciations and display the results at the end of the session.

    The app will allow the user to specify the number of flash cards to study and the number of times to study each flash card.

    The app will allow the user to specify the number of flash cards to study and the number of times to study each flash card.
