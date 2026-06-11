<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'ColiFlow')</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e6eaee;">

                    {{-- Header with logo --}}
                    <tr>
                        <td align="center" style="background-color:#ffffff; padding:36px 32px 28px;">
                            @if (isset($message) && file_exists(public_path('images/logo.png')))
                                <img src="{{ $message->embed(public_path('images/logo.png')) }}"
                                     alt="ColiFlow"
                                     width="240"
                                     style="display:block; margin:0 auto; width:240px; max-width:100%; height:auto; border:0; outline:none;">
                            @endif
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:32px;">
                            @yield('content')
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color:#f4f6f8; padding:20px 32px; text-align:center; border-top:1px solid #e6eaee;">
                            <p style="font-size:12px; color:#9aa5b1; margin:0 0 4px;">
                                © {{ date('Y') }} ColiFlow — Livraison collaborative entre voyageurs et expéditeurs
                            </p>
                            <p style="font-size:11px; color:#b9c2cc; margin:0;">
                                Cet email vous a été envoyé automatiquement, merci de ne pas y répondre.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
