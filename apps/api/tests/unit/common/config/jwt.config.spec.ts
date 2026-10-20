import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/common/config/jwt.config';

describe('JWT configuration', () => {
  it('can sign and verify a token when optional audience and issuer are unset', async () => {
    const previousAudience = process.env.JWT_TOKEN_AUDIENCE;
    const previousIssuer = process.env.JWT_TOKEN_ISSUER;

    try {
      delete process.env.JWT_TOKEN_AUDIENCE;
      delete process.env.JWT_TOKEN_ISSUER;

      const config = jwtConfig();
      expect(config.audience).toBe('myfinances');
      expect(config.issuer).toBe('myfinances-api');

      const jwt = new JwtService();
      const options = {
        secret: 'unit-test-secret',
        audience: config.audience,
        issuer: config.issuer,
      };
      const token = await jwt.signAsync({ sub: 'test-user' }, options);
      await expect(jwt.verifyAsync(token, options)).resolves.toMatchObject({
        sub: 'test-user',
      });
    } finally {
      if (previousAudience === undefined) delete process.env.JWT_TOKEN_AUDIENCE;
      else process.env.JWT_TOKEN_AUDIENCE = previousAudience;
      if (previousIssuer === undefined) delete process.env.JWT_TOKEN_ISSUER;
      else process.env.JWT_TOKEN_ISSUER = previousIssuer;
    }
  });
});
