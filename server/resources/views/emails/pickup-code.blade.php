@extends('emails.layouts.base')

@section('title', 'Votre code de remise ColiFlow')

@section('content')
    <p style="font-size:16px; color:#1f2d3d; margin:0 0 16px;">
        Bonjour {{ $senderName }},
    </p>
    <p style="font-size:15px; color:#52606d; line-height:1.6; margin:0 0 24px;">
        Votre demande pour le colis <strong>« {{ $packageName }} »</strong> a été acceptée par
        <strong>{{ $travelerName }}</strong>.
    </p>
    <p style="font-size:15px; color:#52606d; line-height:1.6; margin:0 0 16px;">
        Au moment de remettre votre colis au voyageur, communiquez-lui le code ci-dessous.
        Il le saisira dans l'application pour confirmer la prise en charge et démarrer la livraison.
    </p>

    {{-- Code box --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
            <td align="center" style="background-color:#eaf4fd; border:1px dashed #0984E3; border-radius:12px; padding:20px;">
                <div style="font-size:13px; color:#0984E3; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">
                    Code de remise
                </div>
                <div style="font-size:34px; font-weight:bold; letter-spacing:8px; color:#0984E3;">
                    {{ $code }}
                </div>
            </td>
        </tr>
    </table>

    <p style="font-size:13px; color:#9aa5b1; line-height:1.6; margin:0;">
        Ne communiquez ce code qu'au voyageur, au moment de la remise du colis.
        Ne le partagez avec personne d'autre.
    </p>
@endsection
