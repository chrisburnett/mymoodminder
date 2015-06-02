module Authentication
  class AuthToken
    def self.encode(payload, exp=6.months.from_now)
      payload[:exp] = exp.to_i
      JWT.encode(payload, Rails.application.secrets.secret_key_base)
    end

    def self.decode(token)
      begin
        payload = JWT.decode(token, Rails.application.secrets.secret_key_base)[0]
        DecodedAuthToken.new(payload)
      rescue JWT::ExpiredSignature
        raise
      rescue
        nil # It will raise an error if it is not a token that was generated with our secret key or if the user changes the contents of the payload
      end
    end

  end

  # We could just return the payload as a hash, but having keys with indifferent access is always nice, plus we get an expired? method that will be useful later
  class DecodedAuthToken < HashWithIndifferentAccess

  end

end
