# Agent OpenAPI

Serverless Tool that serves all your Agents as OpenAPIs

## Getting started

See https://agent.actionschema.com

## Why?

LLM Assistants can be incredibly powerful as a single tool, but there's no easy way to turn an agent into a tool for another agent.

The Agent OpenAPI serves an OpenAPI for talking to an agent, so it can be discovered publicly, and can be used as a tool for other agents.

![](agent-openapi.drawio.png)

## Orchestration Agent

With the above tooling, we can now create an agent that orchestrates certain taks to downstream agents. Taking response time limitations out of the equation, this "agent stacking" pattern can be done in a deeply nested way.

![](orchestration-agent.drawio.png)

![](agent-stacking.drawio.png)

## Goals

- Easy maintenance of your agents
- API access to your agents
- Provide an openapi, and details for each agent
- Provide message api that executes the tools
- High degree of modularity

## Non-goals

- Testing agents
- Support for propriatary features like openai code-interpreter or file-search
