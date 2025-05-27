create a node command line utility script that will generate a json file.  The app will first create a json dictionary with a specified number of Thai words and short phrases as the key and their English translations as the first element of an array as the value.

create a node utility script that will read a specified number of Thai words from the words.json file.  For each word it will ask the google api for the translation into english, and replace the empty string with that translation in the json file


We would now like to create an Expo tabbed UI for our app.  The existing app should be placed on the first tab and a new related app that will use Expo SQLite -- https://docs.expo.dev/versions/latest/sdk/sqlite/ --  to store data about among other things keeping track of a users progress while learning a new language using the app.  To start, let's create the new UI and provide a simple example of using the SQL capabilities.
