# Agent OpenAPI

Serverless Tool that serves all your Agents as OpenAPIs

## Getting started

See https://agent.actionschema.com

## Why?

LLM Assistants can be incredibly powerful as a single tool, but there's no easy way to turn an agent into a tool for another agent.

The Agent OpenAPI serves an OpenAPI for talking to an agent, so it can be discovered publicly, and can be used as a tool for other agents.

![](agent-openapi.drawio.png)

## Orchestration Agent

With the above tooling, we can now create an agent that orchestrates certain taks to downstream agents. Taking response time limitations out of the equation, this "agent stacking" pattern can be done with infinite recursion.

![](orchestration-agent.drawio.png)

![](agent-stacking.drawio.png)

## Non-goals

- Testing agents

# Future goals

After this works decently well...

- combine multiple agents using combination proxy. Orchestration agent POC.
- implement the same idea for twilio (twilio-relay + openhuman) where all phone numbers in your twilio become accessible through their own openapi.
