###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:14-alpine As development

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN yarn

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:14-alpine As build

ARG DB_HOST
ARG DB_USER
ARG DB_PASSWORD
ARG DB_NAME
ARG DB_PORT

WORKDIR /app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn build

RUN yarn typeorm:run

ENV NODE_ENV production

RUN yarn --production && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM node:14-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

# Start the server using the production build
CMD [ "yarn", "start:prod" ]


