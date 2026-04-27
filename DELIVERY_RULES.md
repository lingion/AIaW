# Delivery Rules

## Rule 1: user-specified channel is binding
If the user specifies a delivery channel, do not silently switch.

Examples:
- Telegram attachment
- Private repo release
- GitHub main release

## Rule 2: verify channel before promising
If Telegram attachment is required, validate that the channel/tool is able to send first.
If not possible, report immediately. Do not substitute another channel without explicit user approval.

## Rule 3: mobile-facing changes default to package delivery
For any mobile-visible change, default completion means a fresh package exists.
