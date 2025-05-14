# Building GenAI email agents with Twilio SendGrid & Langflow

## Getting set up

To run this workshop, the first thing you will want to do is to create your own repo based on the template. In GitHub, click the green _Use this template_ button and choose _Create a new repository_.

Once you have created your own repository, click on the green _Code_ button, choose the _Codespaces_ tab and click the green _Create codespace on main_ button.

The codespace will start up, install Node.js, Python, and Langflow and you will be ready to build.

## Running Langflow

Open the terminal and run the following command:

```sh
python -m langflow run
```

This will start up Langflow on port 7860 which is being forwarded. Click on the _Ports_ tab, find the address that is forwarding to port 7860 and open the URL. This will give you access to the Langflow interface.

## Build a simple flow

1. Create a new blank flow. You will see an empty canvas.

2. Start by dragging a _Chat Input_ component onto the canvas.

3. Next, drag an _OpenAI Model_ component onto the canvas. You can choose any model that you have access to, but the _OpenAI Model_ component is a good place to start.

4. Add an OpenAI API Key to the model. You can save the API key as a global variable so you can use it in other places without copying and pasting again.

5. Connect the _Message_ output of the _Chat Input_ component to the _Input_ of the _OpenAI Model_ component.

6. Drag a _Chat Output_ component to the canvas. Connect the _Message_ output of the _OpenAI Model_ component to the _Text_ input of the _Chat Output_.

7. Open the _Playground_ and start chatting with your model.

8. Experiment with setting the system message in the _OpenAI Model_ component to give your flow different personalities.

## Add extra knowledge to your flow

So far this flow just connects you to a model. Let's augment this by giving the model some simple context that it doesn't already know.

1. Disconnect the _Chat Input_ from the model.

2. Drag a _URL_ component to the canvas and enter a URL with some information the model can't already know, for example the results of the 2025 Oscars: https://en.wikipedia.org/wiki/97th_Academy_Awards

3. Drag a _Prompt_ component onto the flow. Enter a prompt with variables for the context from the URL and the user query, for example:

   > Information on the Oscars as context:
   >
   > {context}
   >
   > ***
   >
   > If you need to, use the above context to help answer the following question. Otherwise use your own knowledge and charm to answer.
   >
   > {query}

4. You will now see _context_ and _query_ inputs on the _Prompt_ component. Connect the _URL_ component to the _context_ and the _Chat Input_ component to the _query_.

5. Now open the _Playground_ again and ask questions about the subject you have given your model access to.

This is now a very simple idea of a RAG application.

Let's turn it into an agent instead.

## Building an agent

1. Remove the _OpenAI Model_ component from the flow.

2. In it's place, add the _Agent_ component. Set your OpenAI API key

3. Modify the _Prompt_ component to remove the instructions about answering based on the user query. Check the _Tool mode_ setting on the component.

4. Connect the _Prompt_ toolset to the _Agent_ tools input.

5. Update the Agent instructions to let it know it has a tool that can tell it about the subject of the URL.

6. Open the _Playground_ and start talking to the flow. You'll notice that the agent shows the tools it uses when you ask about the subject of your URL.

7. Try adding more tools, describing them in the agent instructions:
   - Connect the _Calculator_ tool to give the model access to arithmatic functions
   - Try connecting a _URL_ tool and asking about things that the model might be able to look up on the web
   - Create a flow using one of the templates and then connect the flow as a tool to see how agents can use other flows and agents.

All the flows can be imported using the JSON files in the `flows` directory.
