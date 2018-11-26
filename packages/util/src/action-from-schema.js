/**
 * Returns the next action for a given schema or null if no/multiple actions
 * can be created
 * @param {object} state
 * @param {object} schema
 */
export const actionFromSchema = (state, schema) => {};
// {
//   type: 'object',
//   additionalProperties: false,
//   required: [
//     'agent',
//     'boxId',
//     'type'
//   ],
//   properties: {
//     type: {
//       'enum': [
//         'PLAY_CARD'
//       ]
//     },
//     prev: {
//       type: 'string'
//     },
//     next: {
//       type: 'string'
//     },
//     signature: {
//       type: 'string'
//     },
//     agent: {
//       'enum': [
//         '@N02q3tS09c5Wb55s3U/QokERjbg7YLOpEEBZATPyxd4=.ed25519'
//       ]
//     },
//     boxId: {
//       'enum': [
//         '@I8YlIVuRZUtamAl6TQk9isvY2jNsagHF6BwhvLuVhr4=.ed25519',
//         '@oUVsbRzcCsbs41rjF4Sa3hAuG08qzSJpyjjAN3EHnLE=.ed25519',
//         '@OQFqMNC05yYLpf+P9YIG4Ob+CoV54LchBnbDuQ/YoJM=.ed25519',
//         '@1r6aJnzAQ3hvW9NYbf8L+qYwFGGn1HwFRazFpjiwviY=.ed25519'
//       ]
//     }
//   }
