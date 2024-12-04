Def respond_to_user(input_string):
    Input_string = input_string.lower()
    
    If ‘hello’ in input_string or ‘hi’ in input_string:
        Return “Hello there! How can I assist you today?”
    Elif ‘help’ in input_string:
        Return “Sure, I’m here to help. What do you need assistance with?”
    Elif ‘bye’ in input_string:
        Return “Goodbye! Have a great day!”
    Else:
        Return “I’m not sure how to respond to that. Can you try asking something else?”

While True:
    # Get user input
    User_input = input(“You: “)
    
    # Check if the user wants to exit the chat
    If user_input.lower() == ‘exit’:
        Print(“Chatbot: Goodbye!”)
        Break
    
    # Get the chatbot’s response and print it
    Response = respond_to_user(user_input)
    Print(f”Chatbot: {response}”)