 @property
    def port(self):
        port = self._hostinfo[1]
        if port is not None:
            try:
                port = int(port, 10)
            except ValueError:
                message = f'Port could not be cast to integer value as {port!r}'
                raise ValueError(message) from None
            if not ( 0 <= port <= 65535):
                raise ValueError("Port out of range 0-65535")
        return port