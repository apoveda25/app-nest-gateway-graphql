import { RemoteGraphQLDataSource } from '@apollo/gateway/dist/datasources';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GatewayModuleOptions, GatewayOptionsFactory } from '@nestjs/graphql';
import { GraphQLRequest, GraphQLResponse } from 'apollo-server-types';
import { sign, verify } from 'jsonwebtoken';

export interface IContext {
  jwt: string;
}

export interface IPayload {
  sub: string;
  scopes: string[];
}

@Injectable()
export class GatewayConfigService implements GatewayOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createGatewayOptions(): GatewayModuleOptions {
    const willSendRequest = this.willSendRequest;
    const didReceiveResponse = this.didReceiveResponse;
    const serviceList = this.configService.get('apollo_key')
      ? {}
      : { serviceList: this.configService.get('services') };

    return {
      gateway: {
        ...serviceList,
        buildService({ url }) {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest,
            didReceiveResponse,
          });
        },
      },
      server: {
        context: ({ req }) => ({
          jwt: req.headers.authorization,
        }),
        cors: true,
      },
    };
  }

  async willSendRequest({
    request,
    context,
  }: {
    request: GraphQLRequest;
    context: IContext;
  }): Promise<void> {
    const payload: unknown = context.jwt
      ? verify(context.jwt, this.configService.get<string>('jwt.secret'))
      : { sub: '', scopes: [] };

    request.http.headers.set('x-user-id', payload['sub']);
    request.http.headers.set(
      'x-user-scopes',
      JSON.stringify(payload['scopes']),
    );
  }

  async didReceiveResponse({
    response,
  }: {
    response: GraphQLResponse;
  }): Promise<GraphQLResponse> {
    if (response.data.signIn) {
      response.data.signIn.token = sign(
        JSON.parse(response.data.signIn.token),
        this.configService.get<string>('jwt.secret'),
        { expiresIn: this.configService.get<string>('jwt.expiresIn') },
      );
    }

    return response;
  }
}
