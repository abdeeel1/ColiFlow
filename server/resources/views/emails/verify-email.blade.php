@extends('emails.layouts.base')

@section('title', 'Vérifiez votre adresse email')

@section('content')
    <p style="font-size:16px; color:#1f2d3d; margin:0 0 16px;">
        Bonjour {{ $name }},
    </p>
    <p style="font-size:15px; color:#52606d; line-height:1.6; margin:0 0 24px;">
        Bienvenue sur <strong>ColiFlow</strong> ! Il ne vous reste qu'une étape : confirmez votre adresse
        email en cliquant sur le bouton ci-dessous pour activer votre compte.
    </p>

    {{-- Button --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
        <tr>
            <td align="center">
                <a href="{{ $url }}"
                   style="display:inline-block; background-color:#0984E3; color:#ffffff; font-size:15px; font-weight:bold; text-decoration:none; padding:14px 32px; border-radius:12px;">
                    Vérifier mon adresse email
                </a>
            </td>
        </tr>
    </table>

    <p style="font-size:13px; color:#9aa5b1; line-height:1.6; margin:0 0 8px;">
        Ce lien expirera dans {{ $expire }} minutes. Si vous n'avez pas créé de compte ColiFlow,
        vous pouvez ignorer cet email.
    </p>
    <p style="font-size:12px; color:#b9c2cc; line-height:1.6; margin:16px 0 0; word-break:break-all;">
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
        <a href="{{ $url }}" style="color:#0984E3;">{{ $url }}</a>
    </p>
@endsection
