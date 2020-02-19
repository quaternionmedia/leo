# Technical Design


1. Cloud (QM hosted)
  - Auth service
  - API
    - Storage
  - Follower (raw !+ subscribed)
  - Band Management
1. Event broker (Crossbar.io)
1. Conductor
  - broadcast(event)
    - Page_Turn | Come_Together | Jump_To_Page
1. Follower
  - subscribeTo(Conductor)
  - consume(events)
